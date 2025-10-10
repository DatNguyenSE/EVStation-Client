using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs.ChargingPackage;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Repository
{
    public class ChargingPackageRepository : IChargingPackageRepository
    {
        private readonly AppDbContext _context;

        public ChargingPackageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<ChargingPackage> CreateAsync(ChargingPackage packageModel)
        {
            await _context.ChargingPackages.AddAsync(packageModel);
            return packageModel;
        }

        public async Task<ChargingPackage?> DeleteAsync(int id)
        {
            var packageModel = await _context.ChargingPackages.FindAsync(id);
            if (packageModel == null)
            {
                return null;
            }
            _context.ChargingPackages.Remove(packageModel);
            return packageModel;
        }

        public async Task<List<ChargingPackage>> GetAllAsync()
        {
            return await _context.ChargingPackages.ToListAsync();
        }

        public async Task<ChargingPackage?> GetByIdAsync(int id)
        {
            return await _context.ChargingPackages.FindAsync(id);
        }

        public async Task<ChargingPackage?> UpdateAsync(int id, UpdateChargingPackageDto packageDto)
        {
            var packageModel = await _context.ChargingPackages.FindAsync(id);
            if (packageModel == null)
            {
                return null;
            }
            if (packageDto.Name != null)
                packageModel.Name = packageDto.Name;
            if (packageDto.Description != null)
                packageModel.Description = packageDto.Description;
            if (packageDto.Price.HasValue)
                packageModel.Price = packageDto.Price.Value;
            if (packageDto.VehicleType.HasValue)
                packageModel.VehicleType = packageDto.VehicleType.Value;
            if (packageDto.DurationDays.HasValue)
                packageModel.DurationDays = packageDto.DurationDays.Value;
            if (packageDto.IsActive.HasValue)
                packageModel.IsActive = packageDto.IsActive.Value;
            return packageModel;
        }

        public async Task<ChargingPackage?> UpdateStatusAsync(int id, UpdateChargingPackageStatusDto packageStatusDto)
        // cho staff/admin đổi trạng thái gói nhanh
        {
            var packageModel = await _context.ChargingPackages.FindAsync(id);
            if (packageModel == null)
            {
                return null;
            }
            packageModel.IsActive = packageStatusDto.IsActive;
            return packageModel;
        }
    }
}