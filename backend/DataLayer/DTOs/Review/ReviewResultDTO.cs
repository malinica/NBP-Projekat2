namespace DataLayer.DTOs.Review;

public class ReviewResultDTO
{
    public required string Id { get; set; }
    public int Rating { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public required string Content { get; set; }
        public UserResultDTO? Author { get; set; } 

}