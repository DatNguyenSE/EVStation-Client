using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.Vehicle;
using API.Entities;
using API.Extensions;
using API.Interfaces;
using API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/vehicle")]
    [ApiController]
    public class VehicleController : ControllerBase
    {
        private readonly IVehicleRepository _vehicleRepo;
        private readonly UserManager<AppUser> _userManager;
        public VehicleController(IVehicleRepository vehicleRepo, UserManager<AppUser> userManager)
        {
            _vehicleRepo = vehicleRepo;
            _userManager = userManager;
        }

        [HttpPost("add")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> AddVehicle([FromBody] VehicleDto vehicleDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var username = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(username);
            if (appUser == null)
            {
                return Unauthorized();
            }

            // kiem tra loai xe
            if (await _vehicleRepo.UserHasVehicleTypeAsync(appUser.Id, vehicleDto.Type))
            {
                return BadRequest($"Bạn đã có xe loại {vehicleDto.Type}. Chỉ được thêm loại khác.");
            }

            // Kiểm tra trùng biển số
            if (await _vehicleRepo.PlateExistsAsync(vehicleDto.Plate))
            {
                return BadRequest("Biển số xe đã tồn tại.");
            }

            var vehicle = new Vehicle
            {
                Model = vehicleDto.Model,
                Type = vehicleDto.Type,
                BatteryCapacityKWh = vehicleDto.BatteryCapacityKWh,
                MaxChargingPowerKW = vehicleDto.MaxChargingPowerKW,
                ConnectorType = vehicleDto.ConnectorType,
                Plate = vehicleDto.Plate,
                OwnerId = appUser.Id,
            };

            var created = await _vehicleRepo.AddVehicleAsync(vehicle);
            return Ok(new
            {
                message = "Vehicle added successfully",
                vehicle = created
            });
        }

        [HttpGet("my")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetMyVehicles()
        {
            var username = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(username);

            if (appUser == null)
            {
                return Unauthorized();
            }

            var vehicles = await _vehicleRepo.GetVehiclesByUserAsync(appUser.Id);

            if (!vehicles.Any())
                return Ok(new List<VehicleResponseDto>()); // hoặc trả thông báo rỗng

            // Map sang DTO
            var result = vehicles.Select(v => v.ToVehicleResponseDto());

            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> UpdateVehicle([FromRoute] int id, [FromBody] VehicleUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            
            var username = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(username);
            if (appUser == null) return Unauthorized();

            var vehicle = await _vehicleRepo.GetVehicleByIdAsync(id);
            if (vehicle == null || vehicle.OwnerId != appUser.Id)
            {
                return NotFound("Không tìm thấy xe hoặc bạn không có quyền.");
            }

            // Nếu đổi loại xe
            if (vehicle.Type != dto.Type)
            {
                if (await _vehicleRepo.UserHasVehicleTypeAsync(appUser.Id, dto.Type))
                {
                    return BadRequest($"Bạn đã có xe loại {dto.Type}. Không thể đổi sang loại này.");
                }
            }

            // Kiểm tra trùng biển số
            if (await _vehicleRepo.PlateExistsAsync(dto.Plate, id))
            {
                return BadRequest("Biển số xe đã tồn tại.");
            }

            // Cập nhật thông tin
            vehicle.Model = dto.Model;
            vehicle.Type = dto.Type;
            vehicle.BatteryCapacityKWh = dto.BatteryCapacityKWh;
            vehicle.MaxChargingPowerKW = dto.MaxChargingPowerKW;
            vehicle.ConnectorType = dto.ConnectorType;
            vehicle.Plate = dto.Plate;

            var success = await _vehicleRepo.UpdateVehicleAsync(vehicle);
            if (!success) return BadRequest("Cập nhật xe thất bại.");
            
            return Ok(new
            {
                message = "Cập nhật xe thành công",
                vehicle = vehicle.ToVehicleResponseDto()
            });
        }
    }
}