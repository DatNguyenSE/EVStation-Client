import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RevenueService } from '../../../core/service/revenue-service';
import { ToastService } from '../../../core/service/toast-service';
import { Chart, registerables } from 'chart.js';
import { Revenues, RevenuesPack } from '../../../_models/revenue';
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
    pkgRevenue!: RevenuesPack;

  totalRevenueSum = 0;
  totalPackageRevenue = 0;
  startDate = '';
  endDate = '';
  granularity = 'Month';
  chart: any;
  pieChart: any;
  ngOnInit() {
    const today = new Date();

    // Lấy ngày đầu và cuối tháng
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Format yyyy/MM/dd
    const pad = (n: number) => n.toString().padStart(2, '0');
    this.startDate = `${firstDay.getFullYear()}-${pad(firstDay.getMonth() + 1)}-${pad(firstDay.getDate())}`;
    this.endDate = `${lastDay.getFullYear()}-${pad(lastDay.getMonth() + 1)}-${pad(lastDay.getDate())}`;
  }
    ngAfterViewInit() {
    // Chờ DOM sẵn sàng rồi mới vẽ biểu đồ
    this.loadDoanhThu();
    this.loadDoanhThuGoi();
  }

  loadDoanhThu() {
    const start = this.formatDateToAPI(this.startDate);
    const end = this.formatDateToAPI(this.endDate);
    this.revenueSvc.loadRevenue(start,end,this.granularity).subscribe({
      next: (res: any) => {

         if (!res || res.length === 0) {
        this.revenues = [];
        this.totalRevenueSum = 0;
        this.toast.info("Không có doanh thu trong ngày này");
        this.renderRevenueChart([]);   // vẽ chart trống
        this.cdf.detectChanges();
        return;
      }
        this.revenues = (res as Revenues[]).map(r => ({
          ...r,
          period: this.formatDateFromBE(r.period)
        }));

        this.totalRevenueSum = this.revenues.reduce((sum, r) => sum + r.totalRevenue, 0);
        this.renderRevenueChart(this.revenues);
        this.cdf.detectChanges();
      },
      error: (err) => {
         if (err.status === 204) {
        this.revenues = [];
        this.totalRevenueSum = 0;
        this.renderRevenueChart([]);
        this.cdf.detectChanges();
        return;
      }
        this.toast.error('Lỗi khi tải doanh thu');
        console.error(err);
      }
    });
  }
  loadDoanhThuGoi(){
    const start = this.formatDateToAPI(this.startDate);
    const end = this.formatDateToAPI(this.endDate);
    this.revenueSvc.loadPackageRevenue(start,end).subscribe({
      next: (res) => {
        this.pkgRevenue = res;
        this.totalPackageRevenue = res.totalPackageRevenue;
        this.renderPieChart(); 
      },
      error: () => this.toast.error('Lỗi tải doanh thu gói dịch vụ'),
    });
  }

  formatDateFromBE(dateStr: string): string {
    const [y, m, d] = dateStr.split('/');
    return `${d}/${m}/${y}`;
  }

  // renderRevenueChart(data: Revenues[]) {
  //   const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
  //   if (this.chart) this.chart.destroy();

  //   this.chart = new Chart(ctx, {
  //     type: 'bar',
  //     data: {
  //       labels: data.map(r => r.stationName),
  //       datasets: [
  //         {
  //           label: 'Doanh thu (VNĐ)',
  //         data: data.map(r => r.totalRevenue),
  //         backgroundColor: 'rgba(59, 130, 246, 0.3)', // xanh nhẹ (blue-500 30%)
  //         borderColor: 'rgba(37, 99, 235, 0.8)',      // xanh đậm hơn 1 chút
  //         borderWidth: 0.8,                           // 🌟 border mảnh hơn
  //         borderRadius: 6,                            // Bo góc cột mềm mại
  //         barPercentage: 0.6,                         // Thu hẹp cột cho gọn
  //         categoryPercentage: 0.7                     // Khoảng cách giữa nhóm
  //         }
  //       ]
  //     },
  //     options: {
  //       plugins: {
  //         title: { display: true, text: 'Doanh thu theo trạm - tháng hiện tại' },
  //         legend: { display: false }
  //       },
  //       scales: {
  //         y: { beginAtZero: true, title: { display: true, text: 'VNĐ' } },
  //         x: { title: { display: true, text: 'Trạm sạc' } }
  //       }
  //     }
  //   });
  // }
  renderRevenueChart(data: Revenues[]) {
  const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
  if (!ctx) return;

  if (this.chart) this.chart.destroy();

  // ⛔ Chart trống (không label, không dataset)
  if (data.length === 0) {
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        plugins: {
          title: { display: true, text: 'Doanh thu theo trạm' }
        }
      }
    });
    return;
  }

  // ✔️ Có dữ liệu → vẽ như cũ
  this.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(r => r.stationName),
      datasets: [
        {
          label: 'Doanh thu (VNĐ)',
          data: data.map(r => r.totalRevenue),
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
          borderColor: 'rgba(37, 99, 235, 0.8)',
          borderWidth: 0.8,
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.7
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

  renderPieChart() {
    const ctxPie = document.getElementById('revenuePie') as HTMLCanvasElement;
    if (!ctxPie) return;
    if (this.pieChart) this.pieChart.destroy();

    this.pieChart = new Chart(ctxPie, {
      type: 'pie',
      data: {
        labels: ['Tiền sạc', 'Tiền gói dịch vụ'],
        datasets: [
          {
            data: [this.totalRevenueSum, this.totalPackageRevenue],
            backgroundColor: ['rgba(59,130,246,0.6)', 'rgba(168,85,247,0.6)'],
            borderColor: ['rgba(37,99,235,1)', 'rgba(126,34,206,1)'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            color: '#1e3a8a',
            font: { size: 16, weight: 'bold' },
          },
          legend: {
            position: 'bottom',
            labels: { color: '#374151', font: { size: 13 } },
          },
        },
      },
    });
  }
  private formatDateToAPI(date: string): string {
  return date.replace(/-/g, '/'); // yyyy-MM-dd → yyyy/MM/dd
}

  applyDateFilter() {
  if (!this.startDate || !this.endDate) {
    this.toast.warning('Vui lòng chọn đủ khoảng thời gian!');
    return;
  }

  // Kiểm tra hợp lệ (ngày bắt đầu <= ngày kết thúc)
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  if (start > end) {
    this.toast.warning('Ngày bắt đầu không được sau ngày kết thúc!');
    return;
  }

  // Tải lại dữ liệu và vẽ biểu đồ
  this.loadDoanhThu();
  this.loadDoanhThuGoi();
}
}
