namespace DataLayer.Models;

public class Project
{
    public required string Id { get; set; }
    public required string Title { get; set; }
    public required string Image { get; set; }
    public required string Description { get; set; }
    public string? Requirements { get; set; } // neki zahtevi projekta, moze i da se izbaci
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ProjectStatus Status { get; set; }
    public string? ApplicationLink { get; set; } //ova dva su kad se zavrsi projekat da moze da se stavi (izbacite ako ocete)
    public string? RepositoryLink { get; set; }

    // Veze
    public List<Tag>? Tags { get; set; }
    public User? CreatedBy { get; set; }
    public List<User>? AppliedBy { get; set; } // ko se prijavio za projekat
    public List<User>? AcceptedUsers { get; set; } // ko je prihvacen za projekat
    public List<User>? InvitedUsers { get; set; } // ko je invajtovan
}
