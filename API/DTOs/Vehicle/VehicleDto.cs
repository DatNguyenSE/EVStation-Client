using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.Vehicle
{
    public class VehicleDto
    {
        [Required]
        public string Model { get; set; } = string.Empty;      // VD: VF e34, Klara S
        [Required]
        [RegularExpression("Car|Motorbike", ErrorMessage = "Type must be 'Car' or 'Motorbike'")]
        public string Type { get; set; } = string.Empty;       // "Car" hoặc "Motorbike"
        [Required]
        public double BatteryCapacityKWh { get; set; }         // dung lượng pin
        [Required]
        public double MaxChargingPowerKW { get; set; }         // công suất sạc tối đa xe hỗ trợ
        [Required]
        public string ConnectorType { get; set; } = string.Empty; // Type2 / CCS2 / Portable
        [Required]
        public string Plate { get; set; } = string.Empty;
    }
}