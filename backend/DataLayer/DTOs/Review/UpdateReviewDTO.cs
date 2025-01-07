namespace DataLayer.DTOs.Review;

public class UpdateReviewDTO
{
    public int Rating { get; set; }
    public required string Content { get; set; }
}
