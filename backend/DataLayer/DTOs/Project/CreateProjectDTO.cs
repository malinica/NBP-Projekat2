namespace DataLayer.DTOs.Project;

public class CreateProjectDTO
{
    public required string Title { get; set; }
    public required string Description { get; set; }
    public required IFormFile Image { get; set; }
    public required List<string> TagsIds { get; set; }
}