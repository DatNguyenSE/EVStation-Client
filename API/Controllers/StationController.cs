using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.Station;
using API.Entities;
using API.Interfaces;
using API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ActionConstraints;

namespace API.Controllers
{
    [Route("api/station")]
    [ApiController]
    public class StationController : ControllerBase
    {
        private readonly IStationRepository _stationRepo;
        // private readonly AppDbContext _context;
        public StationController(IStationRepository stationRepo)
        {
            _stationRepo = stationRepo;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var stations = await _stationRepo.GetAllAsync();
            var stationDtos = stations.Select(s => s.ToStationDto()).ToList();
            return Ok(stationDtos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var station = await _stationRepo.GetByIdAsync(id);
            if (station == null)
            {
                return NotFound();
            }
            return Ok(station.ToStationDto());
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStationDto stationDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var stationModel = stationDto.ToStationFromCreateDto();
            await _stationRepo.CreateAsync(stationModel);
            return CreatedAtAction(nameof(GetById), new { id = stationModel.Id }, stationModel.ToStationDto());
        }

        [HttpPut]
        [Route("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateStationDto stationDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var stationModel = await _stationRepo.UpdateAsync(id, stationDto);
            if (stationModel == null)
            {
                return NotFound();
            }
            return Ok(stationModel.ToStationDto());
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus([FromRoute] int id, [FromBody] StationStatus status)
        {
            var stationModel = await _stationRepo.UpdateStatusAsync(id, status);
            if (stationModel == null)
            {
                return NotFound();
            }
            return Ok(stationModel.ToStationDto());
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var stationModel = await _stationRepo.DeleteAsync(id);
            if (stationModel == null)
            {
                return NotFound();
            }
            return NoContent();
        }

    }
}