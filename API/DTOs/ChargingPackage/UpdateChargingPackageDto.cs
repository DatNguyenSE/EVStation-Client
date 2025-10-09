using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;

namespace API.DTOs.ChargingPackage
{
    public class UpdateChargingPackageDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }    
        public VehicleType? VehicleType { get; set; }        
        public decimal? Price { get; set; }
        public int? DurationDays { get; set; }
        public bool? IsActive { get; set; }
    }
}