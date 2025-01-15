using DataLayer.DTOs.Project;

namespace DataLayer.Services;

public class ProjectService
{
    private readonly BoltGraphClient client;
    private readonly UserService userService;

    public ProjectService(UserService userService)
    {
        this.userService = userService;
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
            var userResult = await userService.GetById(authorId);

            if (userResult.IsError)
                return userResult.Error;

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
                                        WITH p
                                        UNWIND $tagsIds AS tagId
                                        MATCH (t:Tag {Id: tagId})
                                        CREATE (p)-[:HAS_TAG]->(t)
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
                    { "authorId", authorId },
                    { "tagsIds", projectDto.TagsIds }
                },
                CypherResultMode.Set, "neo4j");

            var result = (await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<ProjectResultDTO>(query)).ToList();

            if (result.Any())
            {
                return result.First();
            }

            return "Greška prilikom dodavanja projekta.".ToError();
        }
        catch (Exception)
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

            var result = (await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<ProjectResultDTO>(query)).ToList();

            if (result.Any())
            {
                return result.First();
            }

            return "Projekat nije pronadjen. ".ToError(404);
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom preuzimanja podataka o projektu. ".ToError();
        }
    }

    public async Task<Result<ProjectResultDTO, ErrorMessage>> GetProjectWithTagsAndAuthor(string id)
    {
        try
        {
            var query = new CypherQuery(@"
                                        MATCH (p:Project {Id: $id})-[:CREATED_BY]->(u:User)
                                        OPTIONAL MATCH (p)-[:HAS_TAG]->(t:Tag)
                                        RETURN 
                                            p.Id AS Id, 
                                            p.Title AS Title, 
                                            p.Image AS Image, 
                                            p.Description AS Description, 
                                            p.CreatedAt AS CreatedAt, 
                                            p.UpdatedAt AS UpdatedAt, 
                                            p.Status AS Status, 
                                            COLLECT({ Id: t.Id, Name: t.Name, Description: t.Description }) AS Tags,
                                            { Id: u.Id, Username: u.Username, Email: u.Email } AS CreatedBy",
                new Dictionary<string, object> { { "id", id } },
                CypherResultMode.Projection, "neo4j");

            var result = (await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<ProjectResultDTO>(query)).ToList();

            if (result.Any())
            {
                return result.First();
            }

            return "Projekat nije pronađen.".ToError(404);
        }
        catch (Exception e)
        {
            return "Došlo je do greške prilikom preuzimanja podataka o projektu. ".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> DeleteProject(string id)
    {
        try
        {
            var query = new CypherQuery("MATCH (p:Project {Id: $id}) DETACH DELETE p RETURN count(p) AS deletedCount",
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
            return "Došlo je do greške prilikom brisanja projekta. ".ToError();
        }
    }

    public async Task<Result<ProjectResultDTO, ErrorMessage>> UpdateProject(UpdateProjectDTO projectDto, string id)
    {
        try
        {
            var projectImagePathQuery = new CypherQuery("MATCH(p:Project {Id: $projectId}) RETURN p.Image",
                new Dictionary<string, object>
                {
                    {
                        "projectId", id
                    }
                }, CypherResultMode.Set, "neo4j");

            var projectImagePath = (await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<string>(projectImagePathQuery)).First();

            if (projectDto.Image != null)
            {
                if (!string.IsNullOrEmpty(projectImagePath))
                {
                    var wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
                    var filePath = Path.Combine(wwwrootPath, projectImagePath);
                    if (File.Exists(filePath))
                    {
                        File.Delete(filePath);
                    }
                }

                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(projectDto.Image.FileName);
                var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ProjectsImages");
                var newFilePath = Path.Combine(path, fileName);
                await using (var stream = new FileStream(newFilePath, FileMode.Create))
                {
                    await projectDto.Image.CopyToAsync(stream);
                }
                projectImagePath = $"ProjectsImages/{fileName}";
            }
            var query = new CypherQuery("MATCH (p:Project {Id: $id}) " +
                                        "SET p.Title = $title, " +
                                        "p.Image = $image, " +
                                        "p.Description = $description," +
                                        "p.Status = $status," +
                                        "p.UpdatedAt = $updatedAt RETURN p",
                                        new Dictionary<string, object>
                                        {
                                            {"id", id},
                                            {"title", projectDto.Title},
                                            {"image", projectImagePath},
                                            {"description", projectDto.Description},
                                            {"status", projectDto.Status},
                                            {"updatedAt", DateTime.UtcNow}
                                        },
                                        CypherResultMode.Set, "neo4j");

            var updatedProjects = (await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<ProjectResultDTO>(query)).ToList();

            if (updatedProjects.Any())
            {
                return updatedProjects.First();
            }

            return "Projekat nije pronađen. ".ToError(404);
        }
        catch (Exception e)
        {
            return e.Message.ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> ApplyForProject(string projectId, string userId)
    {
        try
        {
            var query = new CypherQuery("MATCH (u:User {Id: $userId}), (p:Project {Id: $projectId}) MERGE (u)-[:APPLIED_TO]->(p)",
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
            return "Greška prilikom prijavljivanja za projekat. ".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> CancelApplicationForProject(string projectId, string userId)
    {
        try
        {
            var query = new CypherQuery("MATCH (u:User {Id: $userId})-[r:APPLIED_TO]->(p:Project {Id: $projectId}) DELETE r",
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
            return "Greška prilikom odjavljivanja sa projekta. ".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> AcceptUserToProject(string projectId, string userId)
    {
        try
        {
            var query = new CypherQuery("MATCH (u:User {Id: $userId}), (p:Project {Id: $projectId}) " +
                                        "MERGE (u)-[:ACCEPTED_TO]->(p) " +
                                        "WITH u " +
                                        "MATCH (u)-[r:APPLIED_TO]->(p) " +
                                        "DELETE r",
                new Dictionary<string, object>
                {
                    {"userId", userId},
                    {"projectId", projectId}
                },
                CypherResultMode.Set, "neo4j");

            await ((IRawGraphClient)client).ExecuteCypherAsync(query);

            return true;
        }
        catch (Exception e)
        {
            return "Greška prilikom prihvatanja korisnika na projekat. ".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> RemoveUserFromProject(string projectId, string userId)
    {
        try
        {
            var query = new CypherQuery("MATCH (u:User {Id: $userId})-[r:ACCEPTED_TO]->(p:Project {Id: $projectId}) DELETE r",
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
            return "Greška prilikom uklanjanja korisnika sa projekta. ".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> InviteUserToProject(string projectId, string userId)
    {
        try
        {
            var checkIfUserCanBeInvitedQuery =
                new CypherQuery(@"
                                MATCH (u:User {Id: $userId}), (p:Project {Id: $projectId})
                                OPTIONAL MATCH (u)-[r:ACCEPTED_TO|APPLIED_TO|INVITED_TO]->(p)
                                WITH u, p, r
                                WHERE r IS NOT NULL
                                RETURN COUNT(r) AS relCount",
                    new Dictionary<string, object>
                    {
                        { "userId", userId },
                        { "projectId", projectId }
                    },
                    CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<int>(checkIfUserCanBeInvitedQuery);

            if (result.FirstOrDefault() > 0)
            {
                return "Korisnik je već na projektu ili se prijavio ili je već pozvan.".ToError(403);
            }
            
            var query = new CypherQuery("MATCH (u:User {Id: $userId}), (p:Project {Id: $projectId})" +
                                        "MERGE (u)-[:INVITED_TO]->(p)",
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
            return "Greška prilikom slanja pozivnice. ".ToError();
        }
    }
    
    public async Task<Result<bool, ErrorMessage>> AcceptInvitationToProject(string projectId, string userId)
    {
        try
        {
            var query = new CypherQuery("MATCH (u:User {Id: $userId}), (p:Project {Id: $projectId}) " +
                                        "MERGE (u)-[:ACCEPTED_TO]->(p) " +
                                        "WITH u " +
                                        "MATCH (u)-[r:INVITED_TO]->(p) " +
                                        "DELETE r",
                new Dictionary<string, object>
                {
                    {"userId", userId},
                    {"projectId", projectId}
                },
                CypherResultMode.Set, "neo4j");

            await ((IRawGraphClient)client).ExecuteCypherAsync(query);

            return true;
        }
        catch (Exception e)
        {
            return "Greška prilikom prihvatanja pozivnice.".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> CancelInvitationToProject(string projectId, string userId)
    {
        try
        {
            var query = new CypherQuery("MATCH (u:User {Id: $userId})-[r:INVITED_TO]->(p:Project {Id: $projectId}) DELETE r",
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
            return "Greška prilikom uklanjanja pozivnice. ".ToError();
        }
    }
    
    public async Task<Result<string?, ErrorMessage>> GetUserProjectRelationship(string projectId, string userId)
    {
        try
        {
            var query = new CypherQuery(@"
                                    MATCH (u:User {Id: $userId})-[r]->(p:Project {Id: $projectId})
                                    RETURN TYPE(r) AS relationshipType",
                new Dictionary<string, object>
                {
                    { "userId", userId },
                    { "projectId", projectId }
                },
                CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<string>(query);

            return result.FirstOrDefault() ?? "NO_RELATIONSHIP";
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom očitavanja veze između korisnika i projekta.".ToError();
        }
    }


    public async Task<PaginatedResponseDTO<ProjectResultDTO>> SearchProjects(
        string? title = null,
        List<string>? tags = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        int? skip = 0,
        int? limit = 10)
    {
        try
        {
            var filters = new List<string>();

            if (!string.IsNullOrWhiteSpace(title))
                filters.Add("p.Title CONTAINS $title");

            if (tags != null && tags.Any())
                filters.Add("ALL(tag IN $tags WHERE EXISTS((p)-[:HAS_TAG]->(:Tag {Name: tag})))");

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

            parameters.Add("skip", skip);
            parameters.Add("limit", limit);

            var query = new CypherQuery($@"
                MATCH (p:Project)
                {whereClause}
                OPTIONAL MATCH (p)-[:HAS_TAG]->(t:Tag)
                RETURN 
                    p.Id AS Id, 
                    p.Title AS Title, 
                    p.Image AS Image, 
                    p.Description AS Description, 
                    p.CreatedAt AS CreatedAt, 
                    p.UpdatedAt AS UpdatedAt, 
                    p.Status AS Status,
                    COLLECT({{ Id: t.Id, Name: t.Name, Description: t.Description }}) AS Tags
            
                ",
                parameters,
                CypherResultMode.Projection, "neo4j");

            var results = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<ProjectResultDTO>(query);
            if (results == null || !results.Any())
            {
                return new PaginatedResponseDTO<ProjectResultDTO>
                {
                    Data = new List<ProjectResultDTO>(),
                    TotalLength = 0
                };
            }

            var totalLength = results.Count();

            var paginatedResults = results.Skip(skip.Value).Take(limit.Value).ToList();

            return new PaginatedResponseDTO<ProjectResultDTO>
            {
                Data = paginatedResults ?? new List<ProjectResultDTO>(),
                TotalLength = totalLength
            };
        }
        catch (Exception e)
        {
            Console.WriteLine($"Greška: {e.Message}");
            return null;
        }
    }

    public async Task<Result<ProjectResultDTO[], ErrorMessage>> SearchProjectsCreatedByUser(string userId, string status)
    {
        try
        {
            var query = new CypherQuery("MATCH (p:Project {Status: $status})-[:CREATED_BY]->(u:User {Id: $userId}) RETURN p",
                new Dictionary<string, object>
                {
                    {"userId", userId},
                    {"status", status}
                },
                CypherResultMode.Set, "neo4j");

            var projects = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<ProjectResultDTO>(query);

            var projectArray = projects.ToArray();

            if (projectArray.Length > 0)
            {
                return projectArray;
            }

            return "Nema projekata koje je kreirao korisnik. ".ToError();
        }
        catch (Exception)
        {
            return "Greška prilikom prikupljanja projekata. ".ToError();
        }
    }

    public async Task<Result<ProjectResultDTO[], ErrorMessage>> SearchProjectsCompletedByUser(string userId)
    {
        try
        {
            var query = new CypherQuery("MATCH (u:User {Id: $userId})-[r:ACCEPTED_TO]->(p:Project) WHERE p.Status='Completed' RETURN p",
                new Dictionary<string, object>
                {
                    {"userId", userId}
                },
                CypherResultMode.Set, "neo4j");

            var projects = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<ProjectResultDTO>(query);

            var projectArray = projects.ToArray();

            if (projectArray.Length > 0)
            {
                return projectArray;
            }

            return "Nema projekata na kojima je ucestvovao korisnik. ".ToError();
        }
        catch (Exception)
        {
            return "Greška prilikom prikupljanja projekata. ".ToError();
        }
    }

    public async Task<Result<ProjectResultDTO[], ErrorMessage>> SearchProjectsUserWokringOn(string userId)
    {
        try
        {
            var query = new CypherQuery("MATCH (u:User {Id: $userId})-[r:ACCEPTED_TO]->(p:Project) WHERE p.Status='Opened' RETURN p",
                new Dictionary<string, object>
                {
                    {"userId", userId}
                },
                CypherResultMode.Set, "neo4j");

            var projects = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<ProjectResultDTO>(query);

            var projectArray = projects.ToArray();

            if (projectArray.Length > 0)
            {
                return projectArray;
            }

            return "Nema projekata na kojima je ucestvovao korisnik. ".ToError();
        }
        catch (Exception)
        {
            return "Greška prilikom prikupljanja projekata. ".ToError();
        }
    }

    public async Task<Result<ProjectResultDTO[], ErrorMessage>> SearchProjectsWhereUserAppliedTo(string userId)
    {
        try
        {
            var query = new CypherQuery("MATCH (u:User {Id: $userId})-[r:APPLIED_FOR]->(p:Project) RETURN p",
                new Dictionary<string, object>
                {
                    {"userId", userId}
                },
                CypherResultMode.Set, "neo4j");

            var projects = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<ProjectResultDTO>(query);

            var projectArray = projects.ToArray();

            if (projectArray.Length > 0)
            {
                return projectArray;
            }

            return "Nema projekata na kojima se prijavio korisnik. ".ToError();
        }
        catch (Exception)
        {
            return "Greška prilikom prikupljanja projekata. ".ToError();
        }
    }

}