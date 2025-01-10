namespace DataLayer.Models;

public class Review
{
    public required string Id { get; set; }
    public int Rating { get; set; }
    public required string Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Veze
    public User? Author { get; set; }
    public User? Reviewee { get; set; }
}
