using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.DTOs.Reservation
{
    public class ReservationResponseDto
    {
        public int Id { get; set; }
        public int VehicleId { get; set; }
        public int ChargingPostId { get; set; }
        public string? DriverId { get; set; }
        public DateTime TimeSlotStart { get; set; }
        public DateTime TimeSlotEnd { get; set; }
        public int SlotCount { get; set; }
        public string? Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}