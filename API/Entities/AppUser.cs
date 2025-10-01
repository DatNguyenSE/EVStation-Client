using Microsoft.AspNetCore.Identity;

namespace API.Entities;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public int Age { get; set; }

    // 1 tài xế có thể có nhiều xe
    public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
