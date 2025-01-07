using DataLayer.DTOs.Review;

namespace DataLayer.Services;

public class ReviewService
{
    private readonly BoltGraphClient client;

    public ReviewService()
    {
        client = new BoltGraphClient(new Uri("bolt://localhost:7687"));
        try
        {
            client.ConnectAsync().Wait();
        }
        catch (Exception) { }
    }

    public async Task<Result<bool, ErrorMessage>> CreateReview(CreateReviewDTO reviewDTO)
    {
        try
        {
            var query = new CypherQuery("CREATE (r:Review {Id: $id, Rating: $rating, Content: $content}) RETURN r",
                                        new Dictionary<string, object>
                                        {
                                            {"id", Guid.NewGuid().ToString()},
                                            {"rating", reviewDTO.Rating},
                                            {"content", reviewDTO.Content}
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
            return "Došlo je do greške prilikom pruzimanja podataka o review-u.".ToError();
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
            return "Došlo je do greške prilikom birsanja review-a.".ToError();
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

}