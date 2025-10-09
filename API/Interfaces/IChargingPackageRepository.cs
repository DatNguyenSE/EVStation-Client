using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.ChargingPackage;
using API.Entities;

namespace API.Interfaces
{
    public interface IChargingPackageRepository
    {
        Task<List<ChargingPackage>> GetAllAsync();
        Task<ChargingPackage?> GetByIdAsync(int id);
        Task<ChargingPackage> CreateAsync(ChargingPackage packageModel);
        Task<ChargingPackage?> UpdateAsync(int id, UpdateChargingPackageDto packageDto);
        Task<ChargingPackage?> DeleteAsync(int id);
        Task<ChargingPackage?> UpdateStatusAsync(int id, UpdateChargingPackageStatusDto packageStatusDto); // inactive cái gói đó đi
    }
}