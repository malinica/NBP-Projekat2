namespace DataLayer.DTOs.Review;

public class CreateReviewDTO
{
    public int Rating { get; set; }
    public required string Content { get; set; }
}