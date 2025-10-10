using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repository
{
    public class ReservationRepository : IReservationRepository
    {
        private readonly AppDbContext _context;
        public ReservationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddReservationAsync(Reservation reservation)
        {
            await _context.Reservations.AddAsync(reservation);
        }

        public async Task<bool> CheckOverlapAsync(int postId, DateTime start, DateTime end)
        {
            // Logic: Hai khoảng thời gian (start, end) và (r.TimeSlotStart, r.TimeSlotEnd) trùng lặp
            // nếu start < r.TimeSlotEnd VÀ r.TimeSlotStart < end
            return await _context.Reservations.AnyAsync(r =>
                r.ChargingPostId == postId &&
                r.Status == ReservationStatus.Confirmed &&
                (
                    start < r.TimeSlotEnd && r.TimeSlotStart < end
                ));
        }

        public async Task<int> CountByDriverInDateAsync(string driverId, DateTime date)
        {
            return await _context.Reservations
                .CountAsync(r => r.DriverId == driverId &&
                                r.CreatedAt.Date == date &&
                                r.Status != ReservationStatus.Cancelled);
        }

        public async Task<Reservation?> GetReservationByIdAsync(int id)
        {
            return await _context.Reservations.FindAsync(id);
        }

        public async Task<bool> IsTimeSlotConflictedAsync(int postId, DateTime start, DateTime end)
        {
            // Chỉ kiểm tra các đặt chỗ đã được xác nhận (Confirmed) đang chiếm slot
            return await _context.Reservations
                .AnyAsync(r => r.ChargingPostId == postId &&
                       r.Status == ReservationStatus.Confirmed &&
                       start < r.TimeSlotEnd &&
                       end > r.TimeSlotStart);
        }
    }
}