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
        catch(Exception ex) {}
    }

    public async Task<Result<User, ErrorMessage>> Create(CreateUserDTO userDto)
    {
        var query = new CypherQuery("CREATE (u:User {Id: {id}, Username: {username}, Email: {email}, Password: {password}}) RETURN u",
                                    new Dictionary<string, object>
                                    {
                                        {"id", new Guid().ToString()},
                                        {"username", userDto.Username},
                                        {"email", userDto.Email},
                                        {"password", userDto.Password}
                                    },
                                    CypherResultMode.Set, "neo4j");

        try
        {
            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<User>(query);
            return result.First();
        }
        catch (Exception ex)
        {
            return "Došlo je do greške prilikom kreiranja korisnika.".ToError();
        }
    }
}
