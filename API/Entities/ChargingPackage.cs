using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities
{
    public class ChargingPackage
    {
        public int Id { get; set; }

        // Tên gói (VD: "Gói Ô tô 30 ngày không giới hạn")
        public string Name { get; set; } = string.Empty;

        // Mô tả chi tiết gói
        public string Description { get; set; } = string.Empty;

        // Loại phương tiện áp dụng (Bike/Car)
        [Column(TypeName = "nvarchar(20)")]
        public VehicleType VehicleType { get; set; }

        // Giá tiền (VNĐ)
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        // Thời gian hiệu lực tính theo ngày (VD: 30)
        public int DurationDays { get; set; } = 30;

        // Gói này hiện có cho phép bán không
        public bool IsActive { get; set; } = true;

        // Ngày tạo
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum VehicleType
    {
        Bike,
        Car
    }
}