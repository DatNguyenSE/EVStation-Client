using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
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
        private readonly IUnitOfWork _uow;
        private readonly UserManager<AppUser> _userManager;

        public VehicleController(IUnitOfWork uow, UserManager<AppUser> userManager)
        {
            _uow = uow;
            _userManager = userManager;
        }

        [HttpPost("add")]
        [Authorize(Roles = "Driver")]
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

            // Kiểm tra trùng biển số
            if (await _uow.Vehicles.PlateExistsAsync(vehicleDto.Plate))
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

            var created = await _uow.Vehicles.AddVehicleAsync(vehicle);

            var result = await _uow.Complete();
            if (!result) return BadRequest("Thêm xe thất bại");

            return Ok(new
            {
                message = "Đã thêm xe thành công",
                vehicle = created
            });
        }

        // lấy thông tin xe của User
        [HttpGet("my")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> GetMyVehicles()
        {
            var username = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(username);

            if (appUser == null)
            {
                return Unauthorized();
            }

            var vehicles = await _uow.Vehicles.GetVehiclesByUserAsync(appUser.Id);

            if (!vehicles.Any())
                return Ok(new List<VehicleResponseDto>()); // hoặc trả thông báo rỗng

            // Map sang DTO
            var result = vehicles.Select(v => v.ToVehicleResponseDto());

            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> UpdateVehicle([FromRoute] int id, [FromBody] VehicleUpdateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var username = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(username);
            if (appUser == null) return Unauthorized();

            var vehicle = await _uow.Vehicles.GetVehicleByIdAsync(id);
            if (vehicle == null || vehicle.OwnerId != appUser.Id)
            {
                return NotFound("Không tìm thấy xe hoặc bạn không có quyền.");
            }

            // Kiểm tra trùng biển số
            if (await _uow.Vehicles.PlateExistsAsync(dto.Plate, id))
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

            await _uow.Vehicles.UpdateVehicleAsync(vehicle);
            var result = await _uow.Complete();
            if (!result) return BadRequest("Cập nhật xe thất bại.");

            return Ok(new
            {
                message = "Cập nhật xe thành công",
                vehicle = vehicle.ToVehicleResponseDto()
            });
        }

        [HttpDelete("my/{id}")]
        [Authorize(Roles = "Driver")]
        public async Task<IActionResult> DeactivateVehicle([FromRoute] int id)
        {
            var username = User.GetUsername();
            var appUser = await _userManager.FindByNameAsync(username);
            if (appUser == null) return Unauthorized();

            var vehicle = await _uow.Vehicles.GetVehicleByIdAsync(id);
            if (vehicle == null)
            {
                return NotFound("Không tìm thấy xe");
            }

            if (vehicle.OwnerId != appUser.Id)
            {
                return Forbid("Bạn không có quyền thao tác trên xe này.");
            }

            if (!vehicle.IsActive)
            {
                return BadRequest("Xe này đã bị vô hiệu hóa trước đó.");
            }

            await _uow.Vehicles.DeactivateVehicleAsync(vehicle);
            var result = await _uow.Complete();
            if (!result) return BadRequest("Vô hiệu hóa xe thất bại.");
            return Ok(new { message = "Xe đã được vô hiệu hóa (inactive)." });
        }
    }
}