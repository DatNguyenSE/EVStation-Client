using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.ChargingPackage;
using API.Interfaces;
using API.Mappers;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;



namespace API.Controllers
{
    [Route("api/charging-package")]
    [ApiController]
    public class ChargingPackageController : ControllerBase
    {
        private readonly IUnitOfWork _uow;

        public ChargingPackageController(IUnitOfWork uow)
        {
            _uow = uow;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var packages = await _uow.ChargingPackages.GetAllAsync();
            var packageDtos = packages.Select(p => p.ToPackageDto()).ToList();
            return Ok(packageDtos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var packageModel = await _uow.ChargingPackages.GetByIdAsync(id);
            if (packageModel == null)
            {
                return NotFound();
            }
            return Ok(packageModel.ToPackageDto());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateChargingPackageDto packageDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var packageModel = packageDto.ToPackageFromCreateDto();
            await _uow.ChargingPackages.CreateAsync(packageModel);

            if (!await _uow.Complete())
                return StatusCode(500, "Không thể lưu gói sạc.");

            return CreatedAtAction(nameof(GetById), new { id = packageModel.Id }, packageModel.ToPackageDto());
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateChargingPackageDto packageDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var packageModel = await _uow.ChargingPackages.UpdateAsync(id, packageDto);
            if (packageModel == null)
            {
                return NotFound();
            }
            if (!await _uow.Complete())
                return StatusCode(500, "Không thể cập nhật gói sạc.");

            return Ok(packageModel.ToPackageDto());
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus([FromRoute] int id, [FromBody] UpdateChargingPackageStatusDto packageDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var packageModel = await _uow.ChargingPackages.UpdateStatusAsync(id, packageDto);
            if (packageModel == null)
            {
                return NotFound();
            }
            if (!await _uow.Complete())
                return StatusCode(500, "Không thể thay đổi trạng thái gói sạc.");

            return Ok(packageModel.ToPackageDto());
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var packageModel = await _uow.ChargingPackages.DeleteAsync(id);
            if (packageModel == null)
            {
                return NotFound();
            }
            if (!await _uow.Complete())
                return StatusCode(500, "Không thể xóa gói sạc.");

            return NoContent();
        }
    }
}