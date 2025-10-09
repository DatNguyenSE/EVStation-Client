using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;

namespace API.DTOs.ChargingPost
{
    public class UpdateChargingPostDto
    {
        public PostType? Type { get; set; }
        public decimal? PowerKW { get; set; }
        public ConnectorType? ConnectorType { get; set; }
        public PostStatus? Status { get; set; }
    }
}