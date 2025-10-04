using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.Station;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Interfaces
{
    public interface IStationRepository
    {
        Task<List<Station>> GetAllAsync();
        Task<Station?> GetByIdAsync(int id);
        Task<Station> CreateAsync(Station station);
        Task<Station?> UpdateAsync(int id, UpdateStationDto stationDto);
        Task<Station?> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<Station?> UpdateStatusAsync(int id, StationStatus status);
    }
}