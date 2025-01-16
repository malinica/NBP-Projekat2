namespace DataLayer.DTOs.User;

public class UpdateUserDTO
{
    public string? Username { get; set; }
    public IFormFile? ProfileImage { get; set; }
}