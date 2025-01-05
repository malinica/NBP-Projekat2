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

            var query = new CypherQuery("CREATE (u:User {Id: $id, Username: $username, Email: $email, PasswordHash: $passwordHash, Role: $role}) RETURN u",
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

            if (result != null)
            {
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

            return "Neuspešna registracija korisnika.".ToError();
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

            if (users == null)
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

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<UserResultDTO>(query);

            if (result != null)
                return result.First();

            return "Korisnik nije pronađen.".ToError(404);
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom preuzimanja podataka o korisniku.".ToError();
        }
    }
}
