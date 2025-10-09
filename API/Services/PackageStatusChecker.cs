using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    // HÀM CHECK STATUS CỦA USERPACKAGE (tự động => nhờ BackgroundService)
    // CỨ 24h SẼ CHECK COI HẾT HẠN CHƯA => không đúng chắc chắn
    // ví dụ EndDate là 7h 21/10 thì ngày 22/10 IsActive = false, vì 0h ngày 22/10 hàm này mới chạy
    public class PackageStatusChecker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;

        public PackageStatusChecker(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                    var expiredPackages = await context.DriverPackages
                        .Where(up => up.IsActive && up.EndDate < DateTime.UtcNow)
                        .ToListAsync();

                    foreach (var p in expiredPackages)
                        p.IsActive = false;

                    if (expiredPackages.Any())
                        await context.SaveChangesAsync();
                }

                // Kiểm tra mỗi 24 giờ
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }
    }
}