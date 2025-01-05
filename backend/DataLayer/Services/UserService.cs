namespace DataLayer.Services;

public class UserService
{
    private readonly BoltGraphClient client;
    public UserService()
    {
        client = new BoltGraphClient(new Uri("bolt://localhost:7687"));
        try
        {
            client.ConnectAsync().Wait();
        }
        catch (Exception) { }
    }

    public async Task<Result<User, ErrorMessage>> Create(CreateUserDTO userDto)
    {
        try
        {
            var query = new CypherQuery("CREATE (u:User {Id: $id, Username: $username, Email: $email, PasswordHash: $password}) RETURN u",
                                        new Dictionary<string, object>
                                        {
                                            {"id", Guid.NewGuid().ToString()},
                                            {"username", userDto.Username},
                                            {"email", userDto.Email},
                                            {"password", userDto.Password} //treba se hash password
                                        },
                                        CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<User>(query);
            return result.First();
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom kreiranja korisnika.".ToError();
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
            
            if(result != null)
                return result.First();
            
            return "Korisnik nije pronađen.".ToError(404);
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom preuzimanja podataka o korisniku.".ToError();
        }
    }
}
