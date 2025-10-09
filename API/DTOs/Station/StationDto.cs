using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;

namespace API.DTOs.Station
{
    // cho list/map Station
    public class StationDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Description { get; set; } = string.Empty;
        public TimeSpan OpenTime { get; set; }
        public TimeSpan CloseTime { get; set; }
        public StationStatus Status { get; set; }
    }
}