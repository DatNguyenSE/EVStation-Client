using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.DTOs.DriverPackage;
using API.Entities;
using API.Interfaces;
using API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/userpackage")]
    [ApiController]
    public class DriverPackageController : ControllerBase
    {
        private readonly IUnitOfWork _uow;

        public DriverPackageController(IUnitOfWork uow)
        {
            _uow = uow;
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var userPackageModels = await _uow.DriverPackages.GetAllAsync();
            var userPackageDtos = userPackageModels.Select(up => up.ToDriverPackageDto()).ToList();
            return Ok(userPackageDtos);
        }

        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            var userPackageModel = await _uow.DriverPackages.GetByIdAsync(id);
            if (userPackageModel == null)
            {
                return NotFound("Không tìm thấy.");
            }
            return Ok(userPackageModel);
        }

        // driver tự xem gói của mình
        [HttpGet("my-packages")]
        [Authorize]
        public async Task<IActionResult> GetByUser()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var userPackageModels = await _uow.DriverPackages.GetByUserAsync(userId);
            var userPackageDtos = userPackageModels.Select(up => up.ToUserPackageViewDto()).ToList();
            return Ok(userPackageDtos);
        }

        // Admin xem gói của user khác
        [HttpGet("{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetByUser(string userId)
        {
            var userPackageModels = await _uow.DriverPackages.GetByUserAsync(userId);
            var userPackageDtos = userPackageModels.Select(up => up.ToUserPackageViewDto()).ToList();
            return Ok(userPackageDtos);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateDriverPackageDto userPackageDto)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized("Cannot found your account!!");

            var userPackageModel = await _uow.DriverPackages.CreateAsync(userId, userPackageDto.PackageId);
            if (userPackageModel == null)
            {
                return NotFound("Package not found!!");
            }
            var result = await _uow.Complete();
            if (!result)
                return BadRequest("Failed to create package");
            return CreatedAtAction(nameof(GetById), new { id = userPackageModel.Id }, userPackageModel);
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userPackageModel = await _uow.DriverPackages.DeleteAsync(id);
            if (userPackageModel == null)
            {
                return NotFound("Cannot found this item");
            }
            
            var result = await _uow.Complete();
            if (!result)
                return BadRequest("Failed to delete");

            return NoContent();
        }
    }
}