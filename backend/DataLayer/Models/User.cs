namespace DataLayer.Models;

public class User : IdentityUser
{
    public override required string Id { get; set; }
    public required string Username { get; set; }
    public override string? Email { get; set; }
    public override string? PasswordHash { get; set; }
    public UserRole Role { get; set; }
    public string? ProfileImage { get; set; } 

    // Relationships
    public List<Review>? WrittenReviews { get; set; }
    public List<Review>? ReceivedReviews { get; set; }
    public List<Tag>? Tags { get; set; }
    public List<Project>? CreatedProjects { get; set; }
    public List<Project>? AppliedTo { get; set; } // projekti na koje se korisnik prijavio
    public List<Project>? AcceptedIn { get; set; } // projekti na kojima je prihvacen
    public List<Project>? InvitedTo { get; set; } // projekti na koje je invajtovan
}
