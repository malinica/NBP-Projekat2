namespace DataLayer.DTOs.Project;

public class ProjectResultDTO
{
    public required string Id { get; set; }
    public required string Title { get; set; }
    public required string Image { get; set; }
    public required string Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ProjectStatus Status { get; set; }
}