using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.Reservation;
using API.Entities;

namespace API.Mappers
{
    public static class ReservationMappers
    {
        public static ReservationResponseDto ToReservationResponseDto(this Reservation reservation)
        {
            return new ReservationResponseDto
            {
                Id = reservation.Id,
                VehicleId = reservation.VehicleId,
                ChargingPostId = reservation.ChargingPostId,
                DriverId = reservation.DriverId,
                TimeSlotStart = reservation.TimeSlotStart,
                TimeSlotEnd = reservation.TimeSlotEnd,
                SlotCount = reservation.SlotCount,
                Status = reservation.Status.ToString(),
                CreatedAt = reservation.CreatedAt
            };
        }
    }
}