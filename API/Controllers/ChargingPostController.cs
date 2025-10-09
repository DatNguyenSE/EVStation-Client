using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.ChargingPost;
using API.Entities;
using API.Interfaces;
using API.Mappers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/posts")]
    [ApiController]
    public class ChargingPostController : ControllerBase
    {
        private readonly IChargingPostRepository _postRepo;
        private readonly IStationRepository _stationRepo;

        public ChargingPostController(IChargingPostRepository postRepo, IStationRepository stationRepo)
        {
            _postRepo = postRepo;
            _stationRepo = stationRepo;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var posts = await _postRepo.GetAllAsync();
            var postDtos = posts.Select(s => s.ToPostDto()).ToList();
            return Ok(postDtos);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var post = await _postRepo.GetByIdAsync(id);
            if (post == null)
            {
                return NotFound();
            }
            return Ok(post.ToPostDto());
        }

        [HttpPost("{stationId}/posts")]
        public async Task<IActionResult> Create([FromRoute] int stationId, [FromBody] CreateChargingPostDto postDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }            

            var postModel = postDto.ToChargingPostFromCreateDto();
            await _postRepo.CreateAsync(stationId, postModel);
            return CreatedAtAction(nameof(GetById), new { id = postModel.Id }, postModel.ToPostDto());
        }

        [HttpPut]
        [Route("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateChargingPostDto postDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var postModel = await _postRepo.UpdateAsync(id, postDto);
            if (postModel == null)
            {
                return NotFound();
            }
            return Ok(postModel.ToPostDto());
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus([FromRoute] int id, [FromBody] PostStatus status)
        {
            var postModel = await _postRepo.UpdateStatusAsync(id, status);
            if (postModel == null)
            {
                return NotFound();
            }
            return Ok(postModel.ToPostDto());
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var postModel = await _postRepo.DeleteAsync(id);
            if (postModel == null)
            {
                return NotFound();
            }
            return NoContent();
        }
    }
}