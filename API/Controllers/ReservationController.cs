using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.DTOs.Reservation;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/reservation")]
    [Authorize(Roles = "Driver")]
    public class ReservationController : ControllerBase
    {
        private readonly IReservationService _reservationService;

        public ReservationController(IReservationService reservationService)
        {
            _reservationService = reservationService;
        }

        /// <summary>
        /// Đặt chỗ sạc xe (1–4 slot, mỗi slot = 1 tiếng)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateReservation([FromBody] CreateReservationDto dto)
        {
            try
            {
                // Lấy driverId từ JWT 
                var driverId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (dto == null)
                {
                    return BadRequest("Dữ liệu đặt chỗ không hợp lệ.");
                }

                var result = await _reservationService.CreateReservationAsync(dto, driverId);
                
                return Ok(new
                {
                    message = "Đặt chỗ thành công!",
                    data = result
                });

            } catch (Exception e)
            {
                return BadRequest(new
                {
                    message = e.Message
                });
            }
        }

    }
}