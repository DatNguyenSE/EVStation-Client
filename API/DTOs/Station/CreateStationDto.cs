using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs.ChargingPost;

namespace API.DTOs.Station
{
    public class CreateStationDto
    {
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double Latitude { get; set; }     //  (có thể để optional nếu sẽ geocode)
        public double Longitude { get; set; }    
        public TimeSpan OpenTime { get; set; }   
        public TimeSpan CloseTime { get; set; }
        public List<CreateChargingPostDto> Posts { get; set; } = new();
    }
}