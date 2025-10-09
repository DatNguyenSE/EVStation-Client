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
        private readonly IChargingPackageRepository _packageRepo;

        public ChargingPackageController(IChargingPackageRepository packageRepo)
        {
            _packageRepo = packageRepo;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var packages = await _packageRepo.GetAllAsync();
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
            var packageModel = await _packageRepo.GetByIdAsync(id);
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
            await _packageRepo.CreateAsync(packageModel);
            return CreatedAtAction(nameof(GetById), new { id = packageModel.Id }, packageModel.ToPackageDto());
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateChargingPackageDto packageDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var packageModel = await _packageRepo.UpdateAsync(id, packageDto);
            if (packageModel == null)
            {
                return NotFound();
            }
            return Ok(packageModel.ToPackageDto());
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus([FromRoute] int id, [FromBody] UpdateChargingPackageStatusDto packageDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            
            var packageModel = await _packageRepo.UpdateStatusAsync(id, packageDto);
            if (packageModel == null)
            {
                return NotFound();
            }
            return Ok(packageModel.ToPackageDto());
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var packageModel = await _packageRepo.DeleteAsync(id);
            if (packageModel == null)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}