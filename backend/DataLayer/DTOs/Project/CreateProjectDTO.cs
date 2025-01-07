namespace DataLayer.DTOs.Project;

public class CreateProjectDTO
{
    public required string Title { get; set; }
    public required string Image { get; set; }
    public required string Description { get; set; }
}