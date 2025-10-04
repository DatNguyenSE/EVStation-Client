using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;

namespace API.DTOs.ChargingPost
{
    public class ChargingPostDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public PostType Type { get; set; }
        public decimal PowerKW { get; set; }
        public ConnectorType ConnectorType { get; set; }
        public PostStatus Status { get; set; }
        public string QRCodeUrl { get; set; } = string.Empty;
    }
}