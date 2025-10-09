using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;

namespace API.Interfaces
{
    public interface IDriverPackageRepository
    {
        Task<List<DriverPackage>> GetAllAsync();
        Task<DriverPackage?> GetByIdAsync(int id);
        Task<List<DriverPackage>> GetByUserAsync(string userId);
        Task<DriverPackage> CreateAsync(string appUserId, int packageId);
        Task<DriverPackage?> DeleteAsync(int id);
    }
}