using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.ChargingPackage;
using API.Entities;

namespace API.DTOs.DriverPackage
{
    public class DriverPackageDto
    {
        public int Id { get; set; }
        public string AppUserId { get; set; } = string.Empty;
        public int PackageId { get; set; }
        public Entities.ChargingPackage? Package { get; set; }
        public DateTime StartDate { get; set; } = DateTime.UtcNow;
        public DateTime EndDate { get; set; }
        public bool IsActive { get; set; } = true;
        public VehicleType VehicleType { get; set; }
    }
}