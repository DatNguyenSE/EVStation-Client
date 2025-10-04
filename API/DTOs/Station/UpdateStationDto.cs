using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;

namespace API.DTOs.Station
{
    public class UpdateStationDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public TimeSpan OpenTime { get; set; }
        public TimeSpan CloseTime { get; set; }
    }
}