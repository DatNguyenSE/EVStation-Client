namespace API.Data;

using Microsoft.EntityFrameworkCore;
using API.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using API.Entities.Wallet;


public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions dbContextOptions) : base(dbContextOptions)
    {
        
    } 

    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Wallet> Wallets { get; set; }
    public DbSet<WalletTransaction> WalletTransactions { get; set; }
    public DbSet<Station> Stations { get; set; }
    public DbSet<ChargingPost> Posts { get; set; }  

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Vehicle>()
            .HasIndex(v => v.Plate)
            .IsUnique();

        builder.Entity<Vehicle>()
            .HasOne(v => v.Owner)
            .WithMany(u => u.Vehicles)
            .HasForeignKey(v => v.OwnerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Wallet>()
                .HasOne(w => w.appUser)
                .WithOne()
                .HasForeignKey<Wallet>(w => w.UserId);

        builder.Entity<ChargingPost>()
            .Property(p => p.PowerKW)
            .HasPrecision(5, 2);

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
        // var hasher = new PasswordHasher<AppUser>();

        // var adminUser = new AppUser
        // {
        //     Id = "100",
        //     UserName = "admin",
        //     NormalizedUserName = "ADMIN",
        //     Email = "admin@gmail.com",
        //     NormalizedEmail = "ADMIN@GMAIL.COM",
        //     EmailConfirmed = true,
        //     FullName = "System Administrator",
        //     Age = 30   
        // };

        // adminUser.PasswordHash = hasher.HashPassword(adminUser, "Admin@123");

        // builder.Entity<AppUser>().HasData(adminUser);

        // Gan role Admin cho user nay
        // builder.Entity<IdentityUserRole<string>>().HasData(new IdentityUserRole<string>
        // {
        //     RoleId = "1",
        //     UserId = "100"
        // });
    }
}