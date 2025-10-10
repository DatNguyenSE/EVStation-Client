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
        private readonly IUnitOfWork _uow;

        public ChargingPostController(IUnitOfWork uow)
        {
            _uow = uow;
        }

        // Lấy danh sách trụ
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var posts = await _uow.ChargingPosts.GetAllAsync();
            var postDtos = posts.Select(s => s.ToPostDto()).ToList();
            return Ok(postDtos);
        }

        // Lấy chi tiết trụ theo id
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var post = await _uow.ChargingPosts.GetByIdAsync(id);
            if (post == null)
            {
                return NotFound("Không tìm thấy trụ sạc.");
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
            try
            {
                await _uow.ChargingPosts.CreateAsync(stationId, postModel);
                await _uow.Complete(); // Lưu thay đổi
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
            return CreatedAtAction(nameof(GetById), new { id = postModel.Id }, postModel.ToPostDto());
        }

        // Cập nhật trụ sạc
        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateChargingPostDto postDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var postModel = await _uow.ChargingPosts.UpdateAsync(id, postDto);
            if (postModel == null)
            {
                return NotFound("Không tìm thấy trụ để cập nhật.");
            }
            await _uow.Complete();
            return Ok(postModel.ToPostDto());
        }

        // Cập nhật trạng thái trụ sạc
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus([FromRoute] int id, [FromBody] PostStatus status)
        {
            var postModel = await _uow.ChargingPosts.UpdateStatusAsync(id, status);
            if (postModel == null)
            {
                return NotFound("Không tìm thấy trụ để cập nhật trạng thái.");
            }
            await _uow.Complete();
            return Ok(postModel.ToPostDto());
        }

        // Xóa trụ sạc
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var postModel = await _uow.ChargingPosts.DeleteAsync(id);
            if (postModel == null)
            {
                return NotFound("Không tìm thấy trụ để xóa.");
            }
            await _uow.Complete();
            return NoContent();
        }
    }
}