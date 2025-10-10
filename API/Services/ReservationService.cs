using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.Reservation;
using API.Entities;
using API.Interfaces;
using API.Mappers;

namespace API.Services
{
    public class ReservationService : IReservationService
    {
        private readonly IUnitOfWork _uow;
        private readonly IVehicleRepository _vehicleRepo;

        public ReservationService(IUnitOfWork uow, IVehicleRepository vehicleRepository)
        {
            _uow = uow;
            _vehicleRepo = vehicleRepository; 
        }

        public async Task<ReservationResponseDto> CreateReservationAsync(CreateReservationDto dto, string driverId)
        {
            var now = DateTime.UtcNow.AddHours(7);
            // Kiểm tra không đặt trong quá khứ
            if (dto.TimeSlotStart < now)
                throw new Exception("Không thể đặt chỗ trong quá khứ.");

            // Kiểm tra xe có tồn tại không
            var vehicle = await _vehicleRepo.GetVehicleByIdAsync(dto.VehicleId);
            if (vehicle == null)
                throw new Exception("Xe không tồn tại.");
            // Kiểm tra quyền sở hữu
            if (vehicle.OwnerId != driverId)
                throw new Exception("Bạn không có quyền đặt chỗ cho xe này.");

            // Kiểm tra trụ sạc có tồn tại không
            var post = await _uow.ChargingPosts.GetByIdAsync(dto.ChargingPostId);
            if (post == null) 
                throw new Exception("Trụ sạc không tồn tại.");

            // Kiểm tra trạng thái trụ
            if (post.Status != PostStatus.Available)
                throw new Exception($"Trụ sạc hiện đang ở trạng thái {post.Status}, không thể đặt chỗ.");

            // Kiểm tra số slot hợp lệ (1–4)
            if (dto.SlotCount < 1 || dto.SlotCount > 4)
                throw new Exception("Số slot phải từ 1 đến 4.");

            var start = dto.TimeSlotStart;
            var end = start.AddHours(dto.SlotCount);

            // Kiểm tra driver đã đặt bao nhiêu lần trong ngày
            var today = DateTime.Today;
            var countToday = await _uow.Reservations.CountByDriverInDateAsync(driverId, today);
            if (countToday > 2) 
                throw new Exception("Mỗi tài xế chỉ được đặt tối đa 2 lần mỗi ngày.");

            // Kiểm tra trụ sạc có bị trùng giờ không
            bool overlap = await _uow.Reservations.CheckOverlapAsync(dto.ChargingPostId, start, end);
            if (overlap) 
                throw new Exception("Trụ sạc đã có người đặt trong khung giờ này.");

            // Tạo đối tượng Reservation mới 
            var reservation = new Reservation
            {
                VehicleId = dto.VehicleId,
                ChargingPostId = dto.ChargingPostId,
                DriverId = driverId,
                TimeSlotStart = start,
                TimeSlotEnd = end,
                SlotCount = dto.SlotCount,
                Status = ReservationStatus.Confirmed,
                CreatedAt = DateTime.Now
            };

            // Thêm Reservation vào Context (chưa lưu)
            await _uow.Reservations.AddReservationAsync(reservation);

            // Cập nhật trạng thái trụ
            post.Status = PostStatus.Reserved;
            await _uow.ChargingPosts.UpdateStatusAsync(post.Id, PostStatus.Reserved);

            // Hoàn tất giao dịch (Lưu cả Reservation và Post trong 1 Transaction)
            if (await _uow.Complete())
            {
                // Trả về DTO phản hồi
                return reservation.ToReservationResponseDto();
            }
            throw new Exception("Lỗi hệ thống: Không thể hoàn tất giao dịch đặt chỗ.");
        }
    }
}