using DataLayer.DTOs.Review;

namespace DataLayer.Services;

public class ReviewService
{
    private readonly BoltGraphClient client;
    private readonly UserService userService;

    public ReviewService(UserService userService)
    {
        this.userService = userService;
        client = new BoltGraphClient(new Uri("bolt://localhost:7687"));
        try
        {
            client.ConnectAsync().Wait();
        }
        catch (Exception) { }
    }

    public async Task<Result<bool, ErrorMessage>> CreateReview(CreateReviewDTO reviewDTO, string authorId)
    {
        try
        {
            var userResult = await userService.GetById(authorId);

            if (userResult.IsError)
                return userResult.Error;

            var query = new CypherQuery("""
                                        MATCH (u:User {Id: $authorId})
                                        CREATE (r:Review {
                                            Id: $id,
                                            Rating: $rating,
                                            Content: $content,
                                            CreatedAt: $createdAt,
                                            UpdatedAt: $updatedAt
                                        })-[:CREATED_BY]->(u)
                                        RETURN r
                                        """,
                                        new Dictionary<string, object>
                                        {
                                            {"id", Guid.NewGuid().ToString()},
                                            {"rating", reviewDTO.Rating},
                                            {"content", reviewDTO.Content},
                                            {"createdAt", DateTime.UtcNow},
                                            {"updatedAt", DateTime.UtcNow},
                                            {"authorId", authorId}
                                        },
                                        CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<Review>(query);

            if (result != null)
            {
                return true;
            }

            return "Greška prilikom dodavanja review-a. ".ToError();
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom kreiranje review-a. ".ToError();
        }
    }

    public async Task<Result<ReviewResultDTO, ErrorMessage>> GetReviewById(string id)
    {
        try
        {
            var query = new CypherQuery("MATCH (r:Review {Id: $id}) RETURN r",
                                        new Dictionary<string, object>
                                        {
                                            {"id", id},
                                        },
                                        CypherResultMode.Set, "neo4j");
            
            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<ReviewResultDTO>(query);

            if(result != null)
            {
                return result.First();
            }

            return "Review nije pronađen.".ToError(404);
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom preuzimanja podataka o review-u.".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> DeleteReview(string id)
    {
        try
        {
            var query = new CypherQuery("MATCH (r:Review {Id: $id}) DELETE r RETURN count(r) AS deletedCount",
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

            return "Review nije pronađen.".ToError();
        }
        catch(Exception)
        {
            return "Došlo je do greške prilikom brisanja review-a.".ToError();
        }
    }

    public async Task<Result<bool, ErrorMessage>> UpdateReview(string id, UpdateReviewDTO reviewDTO)
    {
        try
        {
            var query = new CypherQuery(
                "MATCH (r:Review {Id: $id}) " +
                "SET r.Rating = $rating, r.Content = $content " +
                "RETURN r",
                new Dictionary<string, object>
                {
                    {"id", id},
                    {"rating", reviewDTO.Rating},
                    {"content", reviewDTO.Content}
                },
                CypherResultMode.Set, "neo4j");

            var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<Review>(query);

            if (result != null && result.Any())
            {
                return true;
            }

            return "Review nije pronađen.".ToError(404);
        }
        catch (Exception)
        {
            return "Došlo je do greške prilikom ažuriranja review-a.".ToError();
        }
    }


   public async Task<PaginatedResponseDTO<ReviewResultDTO>> GetReviewsFromUser(string username, int? skip = 0, int limit = 10)
{
    try
    {
        var userResult = await userService.GetByUsername(username);
        if (userResult.IsError)
        {
            return new PaginatedResponseDTO<ReviewResultDTO>
            {
                Data = null,
                TotalLength = 0
            };
        }

        var query = new CypherQuery("""
            MATCH (u:User {Username: $username})-[:CREATED_BY]->(r:Review)
            RETURN r
            """,
            new Dictionary<string, object>
            {
                {"username", username}
            },
            CypherResultMode.Set, "neo4j");

        var result = await ((IRawGraphClient)client).ExecuteGetCypherResultsAsync<Review>(query);

        if (result != null && result.Any())
        {
            var reviewDtos = result
                .Skip(skip ?? 0)
                .Take(limit)
                .Select(r => new ReviewResultDTO
                {
                    Id = r.Id,
                    Content = r.Content,
                    Rating = r.Rating,
                })
                .ToList();

            return new PaginatedResponseDTO<ReviewResultDTO>
            {
                Data = reviewDtos,
                TotalLength = result.Count()
            };
        }

        return new PaginatedResponseDTO<ReviewResultDTO>
        {
            Data = new List<ReviewResultDTO>(),
            TotalLength = 0
        };
    }
    catch (Exception)
    {
        return new PaginatedResponseDTO<ReviewResultDTO>
        {
            Data = new List<ReviewResultDTO>(),
            TotalLength = 0
        };
    }
}



}