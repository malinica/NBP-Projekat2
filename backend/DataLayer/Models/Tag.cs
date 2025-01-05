namespace DataLayer.Models;

public class Tag
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public required string Description { get; set; }
    public List<User>? Users { get; set; }
    public List<Project>? Projects { get; set; }
}
