namespace DataLayer.DTOs.Project;

public class UpdateProjectDTO
{
    public required string Title { get; set; }
    public required string Description { get; set; }
    public ProjectStatus Status { get; set; }
    public IFormFile? Image { get; set; }
}