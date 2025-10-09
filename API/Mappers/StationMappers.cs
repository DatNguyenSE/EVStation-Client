using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.Station;
using API.Entities;

namespace API.Mappers
{
    public static class StationMappers
    {
        public static StationDto ToStationDto(this Station stationModel)
        {
            return new StationDto
            {
                Id = stationModel.Id,
                Name = stationModel.Name,
                Code = stationModel.Code,
                Address = stationModel.Address,
                Latitude = stationModel.Latitude,
                Longitude = stationModel.Longitude,
                Description = stationModel.Description,
                OpenTime = stationModel.OpenTime,
                CloseTime = stationModel.CloseTime,
                Status = stationModel.Status
            };
        }

        public static Station ToStationFromCreateDto(this CreateStationDto stationDto)
        {
            return new Station
            {
                Name = stationDto.Name,
                Address = stationDto.Address,
                Latitude = stationDto.Latitude,
                Longitude = stationDto.Longitude,
                OpenTime = stationDto.OpenTime,
                CloseTime = stationDto.CloseTime,
                Posts = stationDto.Posts.Select(p => p.ToChargingPostFromCreateDto()).ToList()
            };
        }
    }
}