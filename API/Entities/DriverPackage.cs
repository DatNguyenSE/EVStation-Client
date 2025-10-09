using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace API.Entities
{
    public class DriverPackage
    {
        public int Id { get; set; }

        // Khóa ngoại tới người dùng
        public string AppUserId { get; set; } = string.Empty;

        // Khóa ngoại tới gói
        public int PackageId { get; set; }

        public ChargingPackage Package { get; set; } = null!;

        // Ngày bắt đầu hiệu lực
        public DateTime StartDate { get; set; } = DateTime.UtcNow;

        // Ngày hết hạn
        public DateTime EndDate { get; set; }

        // Gói này hiện còn hiệu lực hay không
        public bool IsActive { get; set; } = true;

        // Dành cho loại xe nào (Car/Bike) – giúp check nhanh
        public VehicleType VehicleType { get; set; }
    }
}