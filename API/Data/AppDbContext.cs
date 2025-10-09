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
    public DbSet<ChargingPost> ChargingPosts { get; set; }  
    public DbSet<ChargingPackage> ChargingPackages { get; set; }
    public DbSet<DriverPackage> DriverPackages { get; set; }

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

        builder.Entity<ChargingPackage>()
            .Property(p => p.Price)
            .HasPrecision(18, 2);

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
                Name = "Driver",
                NormalizedName = "DRIVER"
            },
            new IdentityRole {
                Id = "3",
                Name = "Manager",
                NormalizedName = "MANAGER"
            },
            new IdentityRole {
                Id = "4",
                Name = "Staff",
                NormalizedName = "STAFF"
            },
            new IdentityRole {
                Id = "5",
                Name = "Technician",
                NormalizedName = "TECHNICIAN"
            },
        };
        builder.Entity<IdentityRole>().HasData(roles);
    }
}