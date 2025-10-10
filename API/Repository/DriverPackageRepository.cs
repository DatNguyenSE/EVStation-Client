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
    public class DriverPackageRepository : IDriverPackageRepository
    {
        private readonly AppDbContext _context;
        public DriverPackageRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<DriverPackage> CreateAsync(string appUserId, int packageId)
        {
            var packageModel = await _context.ChargingPackages.FindAsync(packageId);
            if (packageModel == null)
            {
                throw new KeyNotFoundException("Không tìm thấy gói");
            }

            var userPackageModel = new DriverPackage
            {
                AppUserId = appUserId,
                PackageId = packageId,
                VehicleType = packageModel.VehicleType,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(packageModel.DurationDays),
                IsActive = true
            };

            await _context.DriverPackages.AddAsync(userPackageModel);

            return userPackageModel;
        }

        public async Task<DriverPackage?> DeleteAsync(int id)
        {
            var userPackageModel = await _context.DriverPackages.FindAsync(id);
            if (userPackageModel == null)
            {
                return null;
            }

            _context.DriverPackages.Remove(userPackageModel);
            return userPackageModel;
        }

        public Task<List<DriverPackage>> GetAllAsync()
        {
            return _context.DriverPackages.Include(p => p.Package).ToListAsync();
        }

        public async Task<DriverPackage?> GetByIdAsync(int id)
        {
            return await _context.DriverPackages.FindAsync(id);
        }

        public Task<List<DriverPackage>> GetByUserAsync(string userId)
        {
            return _context.DriverPackages.Where(p => p.AppUserId == userId).Include(p => p.Package).ToListAsync();
        }
    }
}