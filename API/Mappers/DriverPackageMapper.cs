using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.DriverPackage;
using API.Entities;

namespace API.Mappers
{
    public static class DriverPackageMapper
    {
        public static DriverPackageDto ToDriverPackageDto(this DriverPackage userPackageModel)
        {
            return new DriverPackageDto
            {
                Id = userPackageModel.Id,
                AppUserId = userPackageModel.AppUserId,
                PackageId = userPackageModel.PackageId,
                Package = userPackageModel.Package,
                StartDate = userPackageModel.StartDate,
                EndDate = userPackageModel.EndDate,
                IsActive = userPackageModel.IsActive,
                VehicleType = userPackageModel.VehicleType
            };
        }

        public static DriverPackageViewDto ToUserPackageViewDto(this DriverPackage userPackage)
        {
            return new DriverPackageViewDto
            {
                PackageName = userPackage.Package.Name,
                Description = userPackage.Package.Description,
                StartDate = userPackage.StartDate,
                EndDate = userPackage.EndDate,
                IsActive = userPackage.IsActive,
                VehicleType = userPackage.VehicleType.ToString()
            };
        }
    }
}