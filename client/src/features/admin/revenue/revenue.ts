import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RevenueService } from '../../../core/service/revenue-service';
import { ToastService } from '../../../core/service/toast-service';
import { Chart, registerables } from 'chart.js';
import { StationService } from '../../../core/service/station-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DtoStation } from '../../../_models/station';

Chart.register(...registerables);

@Component({
  selector: 'app-revenue',
  imports: [CommonModule, FormsModule],
  templateUrl: './revenue.html',
  styleUrl: './revenue.css',
})
export class Revenue {

  private revenueSvc = inject(RevenueService);
  private stationSvc = inject(StationService)
  private toast = inject(ToastService);
  private cdf = inject(ChangeDetectorRef);

  stations: DtoStation[] = [];
  stationId: number | null = null;

  granularity: string = 'Month';

  startDate = '';
  endDate = '';

  revenues: any[] = [];
  totalRevenueSum = 0;

  pkgRevenue: any;
  totalPackageRevenue = 0;

  chart: any;
  pieChart: any;

  ngOnInit() {
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.startDate = this.toInputDate(first);
    this.endDate = this.toInputDate(last);

    this.loadStations();
  }

  ngAfterViewInit() {
    this.loadDoanhThu();
    this.loadDoanhThuGoi();
  }

  toInputDate(d: Date) {
    return [
      d.getFullYear(),
      (d.getMonth() + 1).toString().padStart(2, '0'),
      d.getDate().toString().padStart(2, '0')
    ].join('-');
  }

loadStations() {
  this.stationSvc.getStations().subscribe(res => {
    this.stations = res;
    this.cdf.detectChanges(); // ép angular cập nhật và ổn định
  });
}

  loadDoanhThu() {
    const start = this.format(this.startDate);
    const end = this.format(this.endDate);

    this.revenues = []; // reset cũ

    this.revenueSvc.loadRevenue(start, end, this.granularity, this.stationId)
      .subscribe({
        next: (res: any[]) => {

          if (!res || res.length === 0) {
            this.revenues = [];
            this.totalRevenueSum = 0;
            this.renderRevenueChart([]);
            return;
          }

          this.revenues = res;
          this.totalRevenueSum = res.reduce((s, r) => s + r.totalRevenue, 0);

          this.renderRevenueChart(this.revenues);
          this.cdf.detectChanges();
        }
      });
  }

  loadDoanhThuGoi() {
    const start = this.format(this.startDate);
    const end = this.format(this.endDate);

    this.revenueSvc.loadPackageRevenue(start, end)
      .subscribe(res => {
        this.pkgRevenue = res;
        this.totalPackageRevenue = res.totalPackageRevenue;
        this.renderPieChart();
      });
  }

  format(date: string) {
    return date.replace(/-/g, '/');
  }

  applyDateFilter() {
    this.loadDoanhThu();
    this.loadDoanhThuGoi();
  }

  renderRevenueChart(data: any[]) {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.chart) {
      this.chart.clear();
      this.chart.destroy();
      this.chart = null;
    }

    let title = 'Doanh thu';
    if (this.granularity === 'Day') title = 'Doanh thu theo ngày';
    if (this.granularity === 'Month') title = 'Doanh thu theo tháng';
    if (this.granularity === 'Year') title = 'Doanh thu theo năm';

    if (this.stationId && data.length > 0) {
      title += ` - ${data[0].stationName}`;
    } else {
      title += ' - toàn hệ thống';
    }

    // ⭐⭐ LOGIC QUAN TRỌNG:
    // BE trả:
    // - khi không chọn trạm → nhiều trạm → stationName
    // - khi chọn 1 trạm → nhiều ngày → period
    let labels: string[] = [];
    let values: number[] = [];

    if (this.stationId == null) {
      labels = data.map(r => r.stationName);
      values = data.map(r => r.totalRevenue);
    } else {
      labels = data.map(r => r.period);  // theo ngày
      values = data.map(r => r.totalRevenue);
    }

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data: values,
          backgroundColor: 'rgba(59,130,246,0.3)',
          borderColor: 'rgba(37,99,235,1)',
          borderWidth: 1,
          borderRadius: 6
        }]
      },
      options: {
        plugins: {
          title: { display: true, text: title }
        }
      }
    });
  }

  renderPieChart() {
    const ctx = document.getElementById('revenuePie') as HTMLCanvasElement;
    if (!ctx) return;

    if (this.pieChart) {
      this.pieChart.clear();
      this.pieChart.destroy();
    }

    this.pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Tiền sạc', 'Tiền gói dịch vụ'],
        datasets: [{
          data: [this.totalRevenueSum, this.totalPackageRevenue],
          backgroundColor: ['rgba(59,130,246,0.6)', 'rgba(168,85,247,0.6)'],
          borderColor: ['rgba(37,99,235,1)', 'rgba(126,34,206,1)'],
          borderWidth: 1,
        }]
      }
    });
  }
}
