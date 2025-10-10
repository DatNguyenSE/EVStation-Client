using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.Vehicle;

namespace API.DTOs.Account
{
    public class UserProfileDto
    {
        public string Id { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? Role { get; set; }
        public string? FullName { get; set; }
        public int Age { get; set; }
        public List<VehicleResponseDto> Vehicles { get; set; } = new List<VehicleResponseDto>();
    }
}