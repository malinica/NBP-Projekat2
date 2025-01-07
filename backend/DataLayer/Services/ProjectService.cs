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

    public async Task<Result<bool, ErrorMessage>> CreateProject(CreateProjectDTO projectDTO)
    {
        try
        {
            var query = new CypherQuery("CREATE (p:Project {Id: $id, Title: $title, Image: $image, Description: $description}) RETURN p",
                                        new Dictionary<string, object>
                                        {
                                            {"id", Guid.NewGuid().ToString()},
                                            {"title", projectDTO.Title},
                                            {"image", projectDTO.Image},
                                            {"description", projectDTO.Description}
                                        },
                                        CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<Project>(query);

            if (result != null)
            {
                return true;
            }

            return "Greska prilikom dodavanja projekta. ".ToError();
        }
        catch (Exception)
        {
            return "Doslo je do greske prilikom kreiranje projekta. ".ToError();
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

            if(result != null)
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

            if(result.FirstOrDefault() > 0)
            {
                return true;
            }

            return "Projekat nije pronadjen. ".ToError();
        }
        catch(Exception)
        {
            return "Doslo je do greske prilikom birsanja projekta. ".ToError();
        }
    }
}