using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repository
{
    public class VehicleRepository : IVehicleRepository
    {
        private readonly AppDbContext _context;
        public VehicleRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Vehicle> AddVehicleAsync(Vehicle vehicleModel)
        {
            await _context.Vehicles.AddAsync(vehicleModel);
            await _context.SaveChangesAsync();
            return vehicleModel;
        }

        public async Task<Vehicle?> GetVehicleByIdAsync(int id)
        {
            return await _context.Vehicles.FindAsync(id);
        }

        public async Task<IEnumerable<Vehicle>> GetVehiclesByUserAsync(string userId)
        {
            return await _context.Vehicles
                        .Where(v => v.OwnerId == userId)
                        .ToListAsync();
        }

        public async Task<bool> PlateExistsAsync(string plate, int? excludeVehicleId = null)
        {
            return await _context.Vehicles
                .AnyAsync(v => v.Plate == plate && (excludeVehicleId == null || v.Id != excludeVehicleId));
        }

        public async Task<bool> UpdateVehicleAsync(Vehicle vehicle)
        {
            _context.Vehicles.Update(vehicle);
            return await _context.SaveChangesAsync() > 0;
        }

        // kiểm tra user đã có loại xe đó chưa
        public async Task<bool> UserHasVehicleTypeAsync(string userId, string type)
        {
            return await _context.Vehicles.AnyAsync(v => v.OwnerId == userId && v.Type == type);
        }
    }
}