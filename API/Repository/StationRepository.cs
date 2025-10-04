using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.Station;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repository
{
    public class StationRepository : IStationRepository
    {
        private readonly AppDbContext _context;
        public StationRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Station> CreateAsync(Station stationModel)
        {
            // lưu station để có id
            await _context.Stations.AddAsync(stationModel);
            await _context.SaveChangesAsync();
            // generate code cho station
            stationModel.Code = StationCodeHelper.GenerateStationCode(stationModel.Address, stationModel.Id);
            // Generate code cho posts
            int index = 1;
            foreach (var post in stationModel.Posts)
            {
                post.Code = $"{stationModel.Code}-CHG{index:D3}"; 
                index++;
            }

            await _context.SaveChangesAsync();

            return stationModel;
        }

        public async Task<Station?> DeleteAsync(int id)
        {
            var stationModel = await _context.Stations.FindAsync(id);
            if (stationModel == null)
            {
                return null;
            }
            _context.Stations.Remove(stationModel);
            await _context.SaveChangesAsync();
            return stationModel;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.Stations.AnyAsync(s => s.Id == id);
        }

        public async Task<List<Station>> GetAllAsync()
        {
            return await _context.Stations.ToListAsync();
        }

        public async Task<Station?> GetByIdAsync(int id)
        {
            return await _context.Stations.FindAsync(id);
        }

        public async Task<Station?> UpdateAsync(int id, UpdateStationDto stationDto)
        {
            var stationModel = await _context.Stations.FindAsync(id);
            if (stationModel == null)
            {
                return null;
            }
            stationModel.Name = stationDto.Name;
            stationModel.Description = stationDto.Description;
            stationModel.OpenTime = stationDto.OpenTime;
            stationModel.CloseTime = stationDto.CloseTime;
            await _context.SaveChangesAsync();
            return stationModel;
        }

        public async Task<Station?> UpdateStatusAsync(int id, StationStatus status)
        {
            var station = await _context.Stations
                .Include(s => s.Posts) // load luôn các posts
                .FirstOrDefaultAsync(s => s.Id == id);

            if (station == null)
            {
                return null;
            }

            station.Status = status;

            // đổi trạng thái trạm thì đổi trụ luôn
            foreach (var post in station.Posts)
            {
                if (status == StationStatus.Maintenance)
                {
                    post.Status = PostStatus.Maintenance;
                }
                else if (status == StationStatus.Inactive)
                {
                    post.Status = PostStatus.Offline;
                }
                else
                {
                    post.Status = PostStatus.Available;
                }
            }

            await _context.SaveChangesAsync();
            return station;
        }
    }
}