using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.ChargingPost;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repository
{
    public class ChargingPostRepository : IChargingPostRepository
    {
        private readonly AppDbContext _context;
        public ChargingPostRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<ChargingPost> CreateAsync(int stationId, ChargingPost postModel)
        {
            var station = await _context.Stations
                .Include(s => s.Posts)
                .FirstOrDefaultAsync(s => s.Id == stationId);

            if (station == null) throw new Exception("Station not found");

            // lấy số thứ tự cho trụ của trạm đó
            int nextIndex = station.Posts.Any() ? station.Posts.Max(p => int.Parse(p.Code.Split("CHG")[1])) + 1 : 1;

            postModel.Code = $"{station.Code}-CHG{nextIndex.ToString("D3")}";
            postModel.StationId = stationId;

            await _context.ChargingPosts.AddAsync(postModel);
            await _context.SaveChangesAsync();
            return postModel;
        }

        public async Task<ChargingPost?> DeleteAsync(int id)
        {
            var postModel = await _context.ChargingPosts.FindAsync(id);
            if (postModel == null)
            {
                return null;
            }
            _context.ChargingPosts.Remove(postModel);
            await _context.SaveChangesAsync();
            return postModel;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.ChargingPosts.AnyAsync(p => p.Id == id);
        }

        public async Task<List<ChargingPost>> GetAllAsync()
        {
            return await _context.ChargingPosts.ToListAsync();
        }

        public async Task<ChargingPost?> GetByIdAsync(int id)
        {
            return await _context.ChargingPosts.FindAsync(id);
        }

        public async Task<ChargingPost?> UpdateAsync(int id, UpdateChargingPostDto postDto)
        {
            var postModel = await _context.ChargingPosts.FindAsync(id);
            if (postModel == null)
            {
                return null;
            }
            if (postDto.Type.HasValue)
                postModel.Type = postDto.Type.Value;
            if (postDto.PowerKW.HasValue)
                postModel.PowerKW = postDto.PowerKW.Value;
            if (postDto.ConnectorType.HasValue)
                postModel.ConnectorType = postDto.ConnectorType.Value;
            if (postDto.Status.HasValue)
                postModel.Status = postDto.Status.Value;
            await _context.SaveChangesAsync();
            return postModel;
        }

        public async Task<ChargingPost?> UpdateStatusAsync(int id, PostStatus status)
        {
            var post = await _context.ChargingPosts.FindAsync(id);
            if (post == null)
            {
                return null;
            }

            post.Status = status;
            await _context.SaveChangesAsync();
            return post;
        }
    }
}