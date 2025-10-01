using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.Vehicle;
using API.Entities;

namespace API.Mappers
{
    public static class VehicleMapper
    {
        public static VehicleResponseDto ToVehicleResponseDto(this Vehicle vehicleModel)
        {
            return new VehicleResponseDto
            {
                VehicleId = vehicleModel.Id,
                Model = vehicleModel.Model,
                Type = vehicleModel.Type,
                BatteryCapacityKWh = vehicleModel.BatteryCapacityKWh,
                MaxChargingPowerKW = vehicleModel.MaxChargingPowerKW,
                ConnectorType = vehicleModel.ConnectorType,
                Plate = vehicleModel.Plate
            };
        }
    }
}