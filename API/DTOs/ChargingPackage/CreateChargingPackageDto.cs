using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;

namespace API.DTOs.ChargingPackage
{
    public class CreateChargingPackageDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;
        [Required]
        public string Description { get; set; } = string.Empty;
        [Required]
        public VehicleType VehicleType { get; set; }
        [Required]
        public decimal Price { get; set; }
        public int DurationDays { get; set; } = 30;
    }
}