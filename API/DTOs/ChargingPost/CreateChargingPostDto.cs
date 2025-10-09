using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using API.Entities;

namespace API.DTOs.ChargingPost
{
    public class CreateChargingPostDto
    {
        [Required]
        public PostType Type { get; set; }
        [Required]    
        public ConnectorType ConnectorType { get; set; } // Loại cổng
        [Required]
        public decimal PowerKW { get; set; }             // Công suất
        public PostStatus Status { get; set; } = PostStatus.Available;
    }
}