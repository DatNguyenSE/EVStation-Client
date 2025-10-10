using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.Versioning;
using System.Threading.Tasks;

namespace API.DTOs.Reservation
{
    public class CreateReservationDto
    {
        public int VehicleId { get; set; }
        public int ChargingPostId { get; set; }
        // public string? DriverId { get; set; }
        public DateTime TimeSlotStart { get; set; }
        public int SlotCount { get; set; }
    }
}