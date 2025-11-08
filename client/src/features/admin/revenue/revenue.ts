import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RevenueService } from '../../../core/service/revenue-service';
import { ToastService } from '../../../core/service/toast-service';
import { Chart, registerables } from 'chart.js';
import { Revenues } from '../../../_models/revenue';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

Chart.register(...registerables);

@Component({
  selector: 'app-revenue',
  imports: [CommonModule,FormsModule],
  templateUrl: './revenue.html',
  styleUrl: './revenue.css',
})
export class Revenue {
  private revenueSvc = inject(RevenueService);
  private toast = inject(ToastService);
  private cdf = inject(ChangeDetectorRef);

  revenues: Revenues[] = [];
  totalRevenueSum = 0;
  startDate = '';
  endDate = '';
  granularity = 'Month';
  chart: any;

  ngOnInit() {
    const today = new Date();

    // Lấy ngày đầu và cuối tháng
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Format yyyy/MM/dd
    const pad = (n: number) => n.toString().padStart(2, '0');
    this.startDate = `${firstDay.getFullYear()}/${pad(firstDay.getMonth() + 1)}/${pad(firstDay.getDate())}`;
    this.endDate = `${lastDay.getFullYear()}/${pad(lastDay.getMonth() + 1)}/${pad(lastDay.getDate())}`;

    this.loadDoanhThu();
  }

  loadDoanhThu() {
    this.revenueSvc.loadRevenue(this.startDate, this.endDate, this.granularity).subscribe({
      next: (res: any) => {
        // ép kiểu về Revenues[]
        this.revenues = (res as Revenues[]).map(r => ({
          ...r,
          period: this.formatDateFromBE(r.period)
        }));

        this.totalRevenueSum = this.revenues.reduce((sum, r) => sum + r.totalRevenue, 0);
        this.renderRevenueChart(this.revenues);
        this.cdf.detectChanges();
      },
      error: (err) => {
        this.toast.error('Lỗi khi tải doanh thu');
        console.error(err);
      }
    });
  }

  formatDateFromBE(dateStr: string): string {
    const [y, m, d] = dateStr.split('/');
    return `${d}/${m}/${y}`;
  }

  renderRevenueChart(data: Revenues[]) {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(r => r.stationName),
        datasets: [
          {
            label: 'Doanh thu (VNĐ)',
          data: data.map(r => r.totalRevenue),
          backgroundColor: 'rgba(59, 130, 246, 0.3)', // xanh nhẹ (blue-500 30%)
          borderColor: 'rgba(37, 99, 235, 0.8)',      // xanh đậm hơn 1 chút
          borderWidth: 0.8,                           // 🌟 border mảnh hơn
          borderRadius: 6,                            // Bo góc cột mềm mại
          barPercentage: 0.6,                         // Thu hẹp cột cho gọn
          categoryPercentage: 0.7                     // Khoảng cách giữa nhóm
          }
        ]
      },
      options: {
        plugins: {
          title: { display: true, text: 'Doanh thu theo trạm - tháng hiện tại' },
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: 'VNĐ' } },
          x: { title: { display: true, text: 'Trạm sạc' } }
        }
      }
    });
  }
}
