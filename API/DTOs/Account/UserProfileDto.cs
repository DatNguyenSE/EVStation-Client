using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.Account
{
    public class UserProfileDto
    {
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public int Age { get; set; }
    }
}