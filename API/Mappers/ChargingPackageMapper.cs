using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.ChargingPackage;
using API.Entities;

namespace API.Mappers
{
    public static class PackageMapper
    {
        public static ChargingPackageDto ToPackageDto(this ChargingPackage packageModel)
        {
            return new ChargingPackageDto
            {
                Id = packageModel.Id,
                Name = packageModel.Name,
                Description = packageModel.Description,
                VehicleType = packageModel.VehicleType,
                Price = packageModel.Price,
                DurationDays = packageModel.DurationDays,
                IsActive = packageModel.IsActive,
                CreatedAt = packageModel.CreatedAt
            };
        }

        public static ChargingPackage ToPackageFromCreateDto(this CreateChargingPackageDto packageDto)
        {
            return new ChargingPackage
            {
                Name = packageDto.Name,
                Description = packageDto.Description,
                VehicleType = packageDto.VehicleType,
                Price = packageDto.Price,
                DurationDays = packageDto.DurationDays
            };
        }
    }
}