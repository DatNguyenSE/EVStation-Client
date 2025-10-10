using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.Reservation;

namespace API.Interfaces
{
    public interface IReservationService
    {
        /// <summary>
        /// Tạo mới một lượt đặt chỗ cho driver.
        /// - Mỗi driver chỉ được đặt tối đa 2 lần mỗi ngày.
        /// - Mỗi lượt có thể đặt 1–4 slot (mỗi slot = 1 tiếng).
        /// - Không cần đặt cọc.
        /// </summary>
        Task<ReservationResponseDto> CreateReservationAsync(CreateReservationDto dto, string driverId);
    }
}