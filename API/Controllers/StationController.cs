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
using Microsoft.Identity.Client;

namespace API.Controllers
{
    [Route("api/station")]
    [ApiController]
    public class StationController : ControllerBase
    {
        private readonly IUnitOfWork _uow;

        public StationController(IUnitOfWork uow)
        {
            _uow = uow;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var stations = await _uow.Stations.GetAllAsync();
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
            var station = await _uow.Stations.GetByIdAsync(id);
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
            await _uow.Stations.CreateAsync(stationModel);
            var result = await _uow.Complete();
            if (!result) return BadRequest("Tạo trạm thất bại");
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

            var stationModel = await _uow.Stations.UpdateAsync(id, stationDto);
            if (stationModel == null)
            {
                return NotFound();
            }
            var result = await _uow.Complete();
            if (!result) return BadRequest("Cập nhật trạm thất bại");
            return Ok(stationModel.ToStationDto());
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus([FromRoute] int id, [FromBody] StationStatus status)
        {
            var stationModel = await _uow.Stations.UpdateStatusAsync(id, status);
            if (stationModel == null)
            {
                return NotFound();
            }
            var result = await _uow.Complete();
            if (!result) return BadRequest("Cập nhật trạm thất bại");
            return Ok(stationModel.ToStationDto());
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var stationModel = await _uow.Stations.DeleteAsync(id);
            if (stationModel == null)
            {
                return NotFound();
            }
            var result = await _uow.Complete();
            if (!result) return BadRequest("Xoá trạm thất bại");
            return NoContent();
        }

        // API gợi ý trạm gần nhất
        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearBy([FromQuery] double lat, [FromQuery] double lon, [FromQuery] double radiusKm = 5)
        {
            if (radiusKm <= 0) radiusKm = 5;
            var stations = await _uow.Stations.GetNearbyAsync(lat, lon, radiusKm);
            var stationDtos = stations.Select(s => s.ToStationDto()).ToList();

            return Ok(stationDtos);
        }

        // API tìm kiếm trạm
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string address)
        {
            var stations = await _uow.Stations.SearchByAddressAsync(address);
            return Ok(stations.Select(s => s.ToStationDto()));
        }
    }
}