namespace API.Data;

using Microsoft.EntityFrameworkCore;
using API.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions dbContextOptions) : base(dbContextOptions)
    {

    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Seed Roles
        List<IdentityRole> roles = new List<IdentityRole>
        {
            new IdentityRole {
                Id = "1",
                Name = "Admin",
                NormalizedName = "ADMIN"
            },
            new IdentityRole {
                Id = "2",
                Name = "User",
                NormalizedName = "USER"
            },
            new IdentityRole {
                Id = "3",
                Name = "Staff",
                NormalizedName = "STAFF"
            }
        };
        builder.Entity<IdentityRole>().HasData(roles);

        // Seed Admin User
        var hasher = new PasswordHasher<AppUser>();

        var adminUser = new AppUser
        {
            Id = "100",
            UserName = "admin",
            NormalizedUserName = "ADMIN",
            Email = "admin@gmail.com",
            NormalizedEmail = "ADMIN@GMAIL.COM",
            EmailConfirmed = true,
            SecurityStamp = Guid.NewGuid().ToString("D")
        };

        adminUser.PasswordHash = hasher.HashPassword(adminUser, "Admin@123");

        builder.Entity<AppUser>().HasData(adminUser);

        // Gan role Admin cho user nay
        builder.Entity<IdentityUserRole<string>>().HasData(new IdentityUserRole<string>
        {
            RoleId = "1",
            UserId = "100"
        });
    }
}