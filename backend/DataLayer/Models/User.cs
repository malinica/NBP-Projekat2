namespace DataLayer.Models;

public class User
{
    public required string Id { get; set; }
    public required string FirstName { get; set; } //ime i prezime mozemo da izbacimo
    public required string LastName { get; set; }
    public required string Username { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public UserRole Role { get; set; }
    public string? ProfileImage { get; set; } // sliku i datum isto mozemo da izbacimo ako nece pravimo profil korisnika nesto specijalno
    public DateTime CreatedAt { get; set; } 

    // Relationships
    public List<Review>? WrittenReviews { get; set; }
    public List<Review>? ReceivedReviews { get; set; }
    public List<Tag>? Tags { get; set; }
    public List<Project>? CreatedProjects { get; set; }
    public List<Project>? AppliedTo { get; set; } // projekti na koje se korisnik prijavio
    public List<Project>? AcceptedIn { get; set; } // projekti na kojima je prihvacen
    public List<Project>? InvitedTo { get; set; } // projekti na koje je invajtovan
}
