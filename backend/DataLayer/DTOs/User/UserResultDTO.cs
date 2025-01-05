
namespace DataLayer.DTOs.User;

public class UserResultDTO
{
    public required string Id { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public UserRole Role { get; set; }
}
