using DataLayer.DTOs.Project;

namespace DataLayer.Services;

public class ProjectService
{
    private readonly BoltGraphClient client;

    public ProjectService()
    {
        client = new BoltGraphClient(new Uri("bolt://localhost:7687"));
        try
        {
            client.ConnectAsync().Wait();
        }
        catch (Exception) { }
    }

    public async Task<Result<ProjectResultDTO, ErrorMessage>> CreateProject(CreateProjectDTO projectDto, string authorId)
    {
        try
        {
            var userExistsQuery = new CypherQuery("MATCH (u:User {Id: $authorId}) RETURN u",
                new Dictionary<string, object>
                {
                    { "authorId", authorId }
                },
                CypherResultMode.Set, "neo4j");

            var usersResult = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<User>(userExistsQuery);
            var user = usersResult.First();

            if (user == null)
                return "Korisnik nije pronađen.".ToError(404);
            
            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(projectDto.Image.FileName);
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ProjectsImages");
            var filePath = Path.Combine(path, fileName);
            await using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await projectDto.Image.CopyToAsync(stream);
            }

            var query = new CypherQuery("""
                                        MATCH (u:User {Id: $authorId}) 
                                        CREATE (p:Project {
                                            Id: $id, 
                                            Title: $title, 
                                            Image: $image, 
                                            Description: $description, 
                                            CreatedAt: $createdAt, 
                                            UpdatedAt: $updatedAt, 
                                            Status: $status
                                        })-[:CREATED_BY]->(u)
                                        RETURN p
                                        """,
                new Dictionary<string, object>
                {
                    { "id", Guid.NewGuid().ToString() },
                    { "title", projectDto.Title },
                    { "image", $"ProjectsImages/{fileName}" },
                    { "description", projectDto.Description },
                    { "createdAt", DateTime.UtcNow },
                    { "updatedAt", DateTime.UtcNow },
                    { "status", ProjectStatus.Opened },
                    { "authorId", authorId }
                },
                CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<ProjectResultDTO>(query);

            if (result != null)
            {
                return result.First();
            }

            return "Greška prilikom dodavanja projekta.".ToError();
        }
        catch (Exception e)
        {
            return "Došlo je do greške prilikom kreiranja projekta. ".ToError();
        }
    }

    public async Task<Result<ProjectResultDTO, ErrorMessage>> GetProjectById(string id)
    {
        try
        {
            var query = new CypherQuery("MATCH (p:Project {Id: $id}) RETURN p",
                                        new Dictionary<string, object>
                                        {
                                            {"id", id},
                                        },
                                        CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<ProjectResultDTO>(query);

            if (result != null)
            {
                return result.First();
            }

            return "Projekat nije pronadjen. ".ToError(404);
        }
        catch (Exception)
        {
            return "Doslo je do greske prilikom pruzimanja podataka o projektu. ".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> DeleteProject(string id)
    {
        try
        {
            var query = new CypherQuery("MATCH (p:Project {Id: $id}) DELETE p RETURN count(p) AS deletedCount",
                                        new Dictionary<string, object>
                                        {
                                            {"id", id}
                                        },
                                        CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<int>(query);

            if (result.FirstOrDefault() > 0)
            {
                return true;
            }

            return "Projekat nije pronadjen. ".ToError();
        }
        catch (Exception)
        {
            return "Doslo je do greske prilikom birsanja projekta. ".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> UpdateProject(UpdateProjectDTO projectDto, string id)
    {
        try
        {
            var query = new CypherQuery("MATCH (p:Project {Id: $id}) SET p.Title = $title, p.Image = $image, p.Description = $description RETURN p",
                                        new Dictionary<string, object>
                                        {
                                            {"id", id},
                                            {"title", projectDto.Title},
                                            {"image", projectDto.Image},
                                            {"description", projectDto.Description}
                                        },
                                        CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<ProjectResultDTO>(query);

            if (result != null)
            {
                return true;
            }

            return "Projekat sa datim ID-em nije pronadjen. ".ToError(404);
        }
        catch (Exception)
        {
            return "Doslo je do greske prilikom azuriranja projekta. ".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> ApplyForProject(string projectId, string userId)
    {
        try
        {
            var query = new CypherQuery("MATCH (u:User {Id: $userId}), (p:Project {Id: $projectId}) CREATE (u)-[:APPLIED_FOR]->(p)",
                                        new Dictionary<string, object>
                                        {
                                            {"userId", userId},
                                            {"projectId", projectId}
                                        },
                                        CypherResultMode.Set, "neo4j");

            await ((IRawGraphClient)client).ExecuteCypherAsync(query);

            return true;
        }
        catch (Exception)
        {
            return "Greska prilikom prijavljivanja za projekat. ".ToError();
        }
    }

    public async Task<ProjectResultDTO[]> SearchProjects(string? title = null, List<string>? tags = null, DateTime? fromDate = null, DateTime? toDate = null)
{
    try
    {
        var filters = new List<string>();

        if (!string.IsNullOrWhiteSpace(title))
            filters.Add("p.Title CONTAINS $title");

        if (tags != null && tags.Any())
            filters.Add("ANY(tag IN $tags WHERE tag IN p.Tags)");

        if (fromDate.HasValue)
            filters.Add("p.CreatedAt >= $fromDate");

        if (toDate.HasValue)
            filters.Add("p.CreatedAt <= $toDate");
            
        filters.Add("p.Status = 'Opened'");

        var whereClause = filters.Count > 0 ? $"WHERE {string.Join(" AND ", filters)}" : "";

        var parameters = new Dictionary<string, object>();

        if (!string.IsNullOrWhiteSpace(title))
            parameters.Add("title", title);

        if (tags != null && tags.Any())
            parameters.Add("tags", tags);

        if (fromDate.HasValue)
            parameters.Add("fromDate", fromDate.Value);

        if (toDate.HasValue)
            parameters.Add("toDate", toDate.Value);

        var query = new CypherQuery($@"
            MATCH (p:Project)
            {whereClause}
            RETURN p
        ",
        parameters,
        CypherResultMode.Set, "neo4j");

        var results = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<ProjectResultDTO>(query);

        return results?.ToArray() ?? Array.Empty<ProjectResultDTO>();
    }
    catch (Exception e)
    {
        Console.WriteLine($"Greška: {e.Message}");
        return Array.Empty<ProjectResultDTO>();
    }
}

}