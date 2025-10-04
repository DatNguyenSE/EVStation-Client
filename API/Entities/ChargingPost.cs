using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities
{
    public class ChargingPost
    {
        public int Id { get; set; }
        public int StationId { get; set; }
        public string Code { get; set; } = string.Empty;
        [Column(TypeName = "nvarchar(20)")]   // set type cho column chứ không nó để thành int
        public PostType Type { get; set; }
        public decimal PowerKW { get; set; }
        [Column(TypeName = "nvarchar(20)")]   // set type cho column chứ không nó để thành int
        public ConnectorType ConnectorType { get; set; }
        [Column(TypeName = "nvarchar(20)")]   // set type cho column chứ không nó để thành int
        public PostStatus Status { get; set; }
        public byte[]? QRCode { get; set; }
    }

    public enum PostStatus
    {
        Available,   // sẵn sàng
        Occupied,    // đang có xe
        Maintenance, // bảo trì
        Offline      // mất kết nối
    }

    public enum PostType
    {
        Normal,   // AC thường (11kW, Type2)
        Fast,     // DC nhanh (60kW, CCS2)
        Scooter   // Xe máy (1.2kW, VinEScooter)
    }

    public enum ConnectorType
    {
        Type2,       // AC, 11 kW, cho ô tô
        CCS2,        // DC, 60 kW, cho ô tô
        VinEScooter  // AC, 1.2 kW, cho xe máy VinFast
    }
}