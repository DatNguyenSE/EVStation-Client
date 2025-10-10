using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.Vehicle;

namespace API.DTOs.Account
{
    public class RegisterDto
    {
        [Required]
        public string Username { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;

        // Thông tin cá nhân
        [Required]
        public string FullName { get; set; } = string.Empty;
        [Required]
        [Range(18,100,ErrorMessage = "Tuổi phải lớn hơn 18")]
        public int Age { get; set; }

        // Danh sách xe
        public List<VehicleDto> Vehicles { get; set; } = new();
    }
}