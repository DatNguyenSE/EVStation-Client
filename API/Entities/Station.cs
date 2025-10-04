using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities
{
    public class Station
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty; // PGBD - theo tên address
        public string Address { get; set; } = string.Empty; // ví dụ 171 đường Độc Lập, Phú Giáo, Bình Dương
        public double Latitude { get; set; } // vĩ độ
        public double Longitude { get; set; } // kinh độ
        public string? Description { get; set; }
        public TimeSpan OpenTime { get; set; }
        public TimeSpan CloseTime { get; set; }
        [Column(TypeName = "nvarchar(20)")]   // set type cho column chứ không nó để thành int
        public StationStatus Status { get; set; } = StationStatus.Active;
        public List<ChargingPost> Posts { get; set; } = new();
    }

    public enum StationStatus
    {
        Active,
        Inactive,
        Maintenance
    }
}