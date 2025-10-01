using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.Vehicle
{
    public class VehicleResponseDto
    {
        public int VehicleId { get; set; }
        public string Model { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;            // Car / Motorbike
        public double BatteryCapacityKWh { get; set; }
        public double MaxChargingPowerKW { get; set; }
        public string ConnectorType { get; set; } = string.Empty;
        public string Plate { get; set; } = string.Empty;
    }
}