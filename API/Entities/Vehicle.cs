using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities
{
    public class Vehicle
    {
        public int Id { get; set; }
        public string Model { get; set; } = string.Empty;      // VD: VF e34, Klara S
        public string Type { get; set; } = string.Empty;       // "Car" hoặc "Motorbike"
        public double BatteryCapacityKWh { get; set; }         // dung lượng pin
        public double MaxChargingPowerKW { get; set; }         // công suất sạc tối đa xe hỗ trợ
        public string ConnectorType { get; set; } = string.Empty; // Type2 / CCS2 / Portable
        public string Plate { get; set; } = string.Empty;

        // Quan hệ với AppUser
        public string OwnerId { get; set; }                    // FK tới AppUser.Id
        public AppUser Owner { get; set; }                      // navigation property
    }
}