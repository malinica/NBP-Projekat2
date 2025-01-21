using DataLayer.DTOs.Tag;

namespace DataLayer.Services;

public class TagService
{
    private readonly BoltGraphClient client;

    public TagService()
    {
        client = new BoltGraphClient(new Uri("bolt://localhost:7687"));
        try
        {
            client.ConnectAsync().Wait();
        }
        catch (Exception) { }
    }

    public async Task<Result<bool, ErrorMessage>> CreateTag(CreateTagDTO tagDTO)
    {
        try
        {
            var query = new CypherQuery("CREATE (t:Tag {Id: $id, Name: $name, Description: $description}) RETURN t",
                                        new Dictionary<string, object>
                                        {
                                            {"id", Guid.NewGuid().ToString()},
                                            {"name", tagDTO.Name},
                                            {"description", tagDTO.Description}
                                        },
                                        CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<Tag>(query);

            if (result != null)
            {
                return true;
            }

            return "Greška prilikom dodavanja tag-a. ".ToError();
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom kreiranje tag-a. ".ToError();
        }
    }

    public async Task<Result<TagResultDTO, ErrorMessage>> GetTagById(string id)
    {
        try
        {
            var query = new CypherQuery("MATCH (t:Tag {Id: $id}) RETURN t",
                                        new Dictionary<string, object>
                                        {
                                            {"id", id},
                                        },
                                        CypherResultMode.Set, "neo4j");
            
            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<TagResultDTO>(query);

            if(result != null)
            {
                return result.First();
            }

            return "Tag nije pronađen.".ToError(404);
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom pruzimanja podataka o tag-u.".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> DeleteTag(string id)
    {
        try
        {
            var query = new CypherQuery("MATCH (t:Tag {Id: $id}) DETACH DELETE t RETURN count(t) AS deletedCount",
                                        new Dictionary<string, object>
                                        {
                                            {"id", id}
                                        },
                                        CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<int>(query);

            if(result.FirstOrDefault() > 0)
            {
                return true;
            }

            return "Tag nije pronađen.".ToError();
        }
        catch(Exception)
        {
            return "Došlo je do greške prilikom birsanja tag-a.".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> UpdateTag(string id, UpdateTagDTO tagDTO)
    {
        try
        {
            var query = new CypherQuery(
                "MATCH (t:Tag {Id: $id}) " +
                "SET t.Name = $name, t.Description = $description " +
                "RETURN t",
                new Dictionary<string, object>
                {
                    {"id", id},
                    {"name", tagDTO.Name},
                    {"description", tagDTO.Description}
                },
                CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<Tag>(query);

            if (result != null && result.Any())
            {
                return true;
            }

            return "Tag nije pronađen.".ToError(404);
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom ažuriranja tag-a.".ToError();
        }
    }

    public async Task<Result<List<TagResultDTO>, ErrorMessage>> FilterTagsByName(string? tagName)
    {
        try
        {
            var query = new CypherQuery("MATCH (t:Tag) WHERE toLower(t.Name) CONTAINS toLower($tagName) LIMIT 10 RETURN t",
                new Dictionary<string, object>
                {
                    {"tagName", tagName ?? ""}
                },
                CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<TagResultDTO>(query);

            return result.ToList();
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom preuzimanja podataka o tagovima.".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> AddTagToProject(string projectId, string tagId)
    {
        try
        {
            var query = new CypherQuery(@"
                                        MATCH (p:Project {Id: $projectId}), (t:Tag {Id: $tagId})
                                        CREATE (p)-[:HAS_TAG]->(t)",
                new Dictionary<string, object>
                {
                    { "projectId", projectId },
                    { "tagId", tagId }
                },
                CypherResultMode.Projection, "neo4j");

            await ((IRawGraphClient)client).ExecuteCypherAsync(query);

            return true;
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom dodavanja taga u projekat.".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> RemoveTagFromProject(string projectId, string tagId)
    {
        try
        {
            var tagsCountQuery = new CypherQuery(@"
                MATCH (:Project {Id: $projectId})-[:HAS_TAG]->(t:Tag)
                RETURN COUNT(t) AS tagCount",
                new Dictionary<string, object>
                {
                    { "projectId", projectId }
                },
                CypherResultMode.Set, "neo4j");

            var tagCountResult = await ((IRawGraphClient)client)
                .ExecuteGetCypherResultsAsync<int>(tagsCountQuery);

            int tagCount = tagCountResult.FirstOrDefault();
            
            if (tagCount <= 1)
            {
                return "Projekat mora imati bar jedan tag.".ToError(403);
            }
            
            var query = new CypherQuery(@"
                                        MATCH (p:Project {Id: $projectId})-[r:HAS_TAG]->(t:Tag {Id: $tagId}) 
                                        DELETE r",
                new Dictionary<string, object>
                {
                    { "projectId", projectId },
                    { "tagId", tagId }
                },
                CypherResultMode.Projection, "neo4j");

            await ((IRawGraphClient)client).ExecuteCypherAsync(query);

            return true;
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom uklanjanja taga iz projekta.".ToError();
        }
    }
    
    public async Task<Result<bool, ErrorMessage>> AddTagToUser(string userId, string tagId)
    {
        try
        {
            var query = new CypherQuery(@"
                                        MATCH (u:User {Id: $userId}), (t:Tag {Id: $tagId})
                                        MERGE (u)-[:HAS_TAG]->(t)",
                new Dictionary<string, object>
                {
                    { "userId", userId },
                    { "tagId", tagId }
                },
                CypherResultMode.Projection, "neo4j");

            await ((IRawGraphClient)client).ExecuteCypherAsync(query);

            return true;
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom dodavanja taga korisniku.".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> RemoveTagFromUser(string userId, string tagId)
    {
        try
        {
            var query = new CypherQuery(@"
                                        MATCH (u:User {Id: $userId})-[r:HAS_TAG]->(t:Tag {Id: $tagId}) 
                                        DELETE r",
                new Dictionary<string, object>
                {
                    { "userId", userId },
                    { "tagId", tagId }
                },
                CypherResultMode.Projection, "neo4j");

            await ((IRawGraphClient)client).ExecuteCypherAsync(query);

            return true;
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom uklanjanja taga sa korisnika.".ToError();
        }
    }
}