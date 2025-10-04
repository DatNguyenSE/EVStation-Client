using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;

namespace API.DTOs.ChargingPost
{
    public class CreateChargingPostDto
    {
        public PostType Type { get; set; }         
        public ConnectorType ConnectorType { get; set; } // Loại cổng
        public decimal PowerKW { get; set; }             // Công suất
        public PostStatus Status { get; set; } = PostStatus.Available;
    }
}