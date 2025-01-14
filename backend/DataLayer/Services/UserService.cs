namespace DataLayer.Services;

public class UserService
{
    private readonly BoltGraphClient client;
    private readonly PasswordHasher<User> passwordHasher = new PasswordHasher<User>();
    private readonly TokenService tokenService;
    public UserService(TokenService tokenService)
    {
        this.tokenService = tokenService;
        client = new BoltGraphClient(new Uri("bolt://localhost:7687"));
        try
        {
            client.ConnectAsync().Wait();
        }
        catch (Exception) { }
    }

    public async Task<Result<AuthResponseDTO, ErrorMessage>> Register(CreateUserDTO userDto)
    {
        try
        {
            var existingUsersByUsernameQuery = new CypherQuery("MATCH (u:User) WHERE u.Username = $username RETURN u LIMIT 1",
                new Dictionary<string, object>
                {
                    {"username", userDto.Username},
                },
                CypherResultMode.Set, "neo4j");

            var existingUsersByUsername = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<User>(existingUsersByUsernameQuery);
            if (existingUsersByUsername != null && existingUsersByUsername.Any())
                return "Već postoji korisnik sa unetim korisničkim imenom.".ToError(400);
            
            var existingUsersByEmailQuery = new CypherQuery("MATCH (u:User) WHERE u.Email = $email RETURN u LIMIT 1",
                                            new Dictionary<string, object>
                                            {
                                                {"email", userDto.Email},
                                            },
                                            CypherResultMode.Set, "neo4j");
            
            var existingUsersByEmail = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<User>(existingUsersByEmailQuery);
            if (existingUsersByEmail != null && existingUsersByEmail.Any())
                return "Već postoji korisnik sa unetim e-mail-om.".ToError(400);
            
            var query = new CypherQuery("CREATE (u:User {Id: $id, " +
                                                        "Username: $username, " +
                                                        "Email: $email, " +
                                                        "PasswordHash: $passwordHash, " +
                                                        "Role: $role}) RETURN u",
                                        new Dictionary<string, object>
                                        {
                                            {"id", Guid.NewGuid().ToString()},
                                            {"username", userDto.Username},
                                            {"email", userDto.Email},
                                            {"passwordHash", passwordHasher.HashPassword(null!, userDto.Password)},
                                            {"role", UserRole.User}
                                        },
                                        CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<User>(query);

            if (result == null)
            {
                return "Neuspešna registracija korisnika.".ToError();
            }
            
            var user = result.First();
            return new AuthResponseDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = UserRole.User,
                Token = tokenService.CreateToken(user)
            };
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom kreiranja korisnika.".ToError();
        }
    }

    public async Task<Result<AuthResponseDTO, ErrorMessage>> Login(LoginRequestDTO request)
    {
        try
        {
            var query = new CypherQuery("MATCH (u:User) WHERE u.Email = $email RETURN u LIMIT 1",
                                        new Dictionary<string, object>
                                        {
                                            {"email", request.Email},
                                        },
                                        CypherResultMode.Set, "neo4j");

            var users = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<User>(query);

            if (users == null || !users.Any())
                return "Neispravan email ili lozinka.".ToError(403);

            var user = users.First();

            PasswordVerificationResult verificationResult = passwordHasher.VerifyHashedPassword(null!, user.PasswordHash!, request.Password);

            if (verificationResult == PasswordVerificationResult.Failed)
                return "Neispravan email ili lozinka.".ToError(403);

            var accessToken = tokenService.CreateToken(user);

            return new AuthResponseDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Token = accessToken,
                Role = user.Role
            };
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom prijavljivanja.".ToError();
        }
    }

    public async Task<Result<UserResultDTO, ErrorMessage>> GetById(string id)
    {
        try
        {
            var query = new CypherQuery("MATCH (u:User {Id: $id}) RETURN u",
                                        new Dictionary<string, object>
                                        {
                                            {"id", id}
                                        },
                                        CypherResultMode.Set, "neo4j");

            var users = (await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<UserResultDTO>(query)).ToList();

            if (users.Any())
                return users.First();

            return "Korisnik nije pronađen.".ToError(404);
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom preuzimanja podataka o korisniku.".ToError();
        }
    }

    public async Task<Result<List<UserResultDTO>, ErrorMessage>> GetAllUsers()
    {
        try
        {
            var query = new CypherQuery("MATCH (u:User) return u",
                                        new Dictionary<string, object>(),
                                        CypherResultMode.Set, "neo4j");
            
            var users = (await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<UserResultDTO>(query)).ToList();

            if (users.Any())
                return users;
            
            return "Nema korisnika. ".ToError();
        }
        catch(Exception)
        {
            return "Doslo je do greske prilikom vracanja svih korisnika. ".ToError();
        }
    }
    
    public async Task<Result<PaginatedResponseDTO<UserResultDTO>, ErrorMessage>> FilterUsers(
        string? username = null,
        List<string>? tagsIds = null,
        int? page = 1,
        int? pageSize = 10
        )
    {
        try
        {
            var filters = new List<string>();

            if (!string.IsNullOrWhiteSpace(username))
                filters.Add("toLower(u.Username) CONTAINS toLower($username)");

            if (tagsIds != null && tagsIds.Any())
                filters.Add("ALL(tagId IN $tagsIds WHERE EXISTS((u)-[:HAS_TAG]->(:Tag {Id: tagId})))");
            
            var whereClause = filters.Count > 0 ? $"WHERE {string.Join(" AND ", filters)}" : "";

            var parameters = new Dictionary<string, object>();

            if (!string.IsNullOrWhiteSpace(username))
                parameters.Add("username", username);

            if (tagsIds != null && tagsIds.Any())
                parameters.Add("tagsIds", tagsIds);

            var paginationClause = "";

            if (page.HasValue && pageSize.HasValue)
            {
                paginationClause = $" SKIP $skip LIMIT $limit ";
                parameters.Add("skip", (page-1)*pageSize);
                parameters.Add("limit", pageSize);
            }

            var usersQuery = new CypherQuery($@"
                MATCH (u:User)
                {whereClause}
                {paginationClause}
                RETURN 
                    u.Id AS Id, 
                    u.Username AS Username, 
                    u.Email AS Email, 
                    u.Role AS Role, 
                    u.ProfileImage AS ProfileImage
                ",
                parameters,
                CypherResultMode.Projection, "neo4j");
            
            var users = (await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<UserResultDTO>(usersQuery)).ToList();
            
            var totalUsersQuery = new CypherQuery($@"
                MATCH (u:User)
                {whereClause}
                RETURN COUNT(u) AS TotalUsersCount",
                parameters,
                CypherResultMode.Set, "neo4j");
            
            var totalUsersCount = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<int>(totalUsersQuery);

            return new PaginatedResponseDTO<UserResultDTO>
            {
                Data = users,
                TotalLength = totalUsersCount.FirstOrDefault()
            };
        }
        catch(Exception e)
        {
            return e.Message.ToError();
            return "Došlo je do greške prilikom pretrage korisnika. ".ToError();
        }
    }
    
    public async Task<Result<UserResultDTO, ErrorMessage>> GetCurrentUser(ClaimsPrincipal user) {
        try
        {
            var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if(userId != null)
                return await GetById(userId);

            return "Došlo je do greške prilikom učitavanja korisnika.".ToError();
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom učitavanja korisnika.".ToError();
        }
    }
    
    public async Task<Result<PaginatedResponseDTO<UserResultDTO>, ErrorMessage>> GetProjectUsersByType(
        string projectId,
        string type,
        int page = 1, 
        int pageSize = 10) 
    {
        try
        {
            var relationName = type switch
            {
                "accepted" => "ACCEPTED_TO",
                "applied" => "APPLIED_TO",
                "invited" => "INVITED_TO",
                _ => "ACCEPTED_TO"
            };
            
            var query = new CypherQuery("MATCH (p:Project {Id: $projectId})<-[:"+relationName+"]-(u:User)" +
                                        "RETURN  u.Id AS Id, u.Username AS Username, u.Email AS Email, u.Role AS Role, u.ProfileImage AS ProfileImage",
                new Dictionary<string, object>
                {
                    {"projectId", projectId}
                },
                CypherResultMode.Projection, "neo4j");
            
            var users = (await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<UserResultDTO>(query)).ToList();
            
            var paginatedUsers = users.Skip((page-1) * pageSize)
                                      .Take(pageSize)
                                      .ToList();

            return new PaginatedResponseDTO<UserResultDTO>
            {
                Data = paginatedUsers,
                TotalLength = users.Count()
            };
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom učitavanja korisnika.".ToError();
        }
    }

    public async Task<Result<UserResultDTO, ErrorMessage>> GetByUsername(string username)
{
    try
    {
        var query = new CypherQuery(
            "MATCH (u:User {Username: $username}) RETURN u",
            new Dictionary<string, object>
            {
                { "username", username }
            },
            CypherResultMode.Set,
            "neo4j"
        );

        var users = (await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<UserResultDTO>(query)).ToList();

        if (users.Any())
            return users.First();

        return "Korisnik sa zadatim korisničkim imenom nije pronađen.".ToError(404);
    }
    catch (Exception)
    {
        return "Došlo je do greške prilikom preuzimanja podataka o korisniku.".ToError();
    }
}

}
