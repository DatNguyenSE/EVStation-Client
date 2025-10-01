using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;

namespace API.Interfaces
{
    public interface IVehicleRepository
    {
        Task<bool> UserHasVehicleTypeAsync(string userId, string type);
        Task<Vehicle> AddVehicleAsync(Vehicle vehicleModel);
        Task<IEnumerable<Vehicle>> GetVehiclesByUserAsync(string userId);
        Task<Vehicle?> GetVehicleByIdAsync(int id);
        Task<bool> UpdateVehicleAsync(Vehicle vehicle);
        Task<bool> PlateExistsAsync(string plate, int? excludeVehicleId = null);
    }
}