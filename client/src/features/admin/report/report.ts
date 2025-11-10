import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { EvaluateReportRequest, Reports } from '../../../_models/report';
import { Subscription } from 'rxjs';
import { ReportService } from '../../../core/service/report-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../../core/service/toast-service';

@Component({
  selector: 'app-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './report.html',
  styleUrl: './report.css',
})
export class Report {
  // 🧩 Services
  reportService = inject(ReportService);
  private cdr = inject(ChangeDetectorRef);
  toast = inject(ToastService);

  // 📋 Data
  reports: Reports[] = [];
  selectedReport?: Reports;
  notifications: any[] = [];
  unreadCount = 0;

  // 💬 Popup flags
  showDetailModal = false;
  showAssignModal = false;
  showEvaluateModal = false;

  // 🧑‍🔧 Giao việc
  technicianId = '';
  selectedReportForAssign?: Reports;

  // 🧮 Đánh giá
  evaluation: EvaluateReportRequest = {
    isCritical: false,
    maintenanceStartTime: '',
    maintenanceEndTime: ''
  };
  selectedReportForEvaluate?: Reports;

  // xem ảnh 
  previewImageUrl: string | null = null;

  private subs: Subscription[] = [];




  openEvaluateModal(report: Reports): void {
  this.selectedReportForEvaluate = report;
  this.showEvaluateModal = true;
}

closeEvaluateModal(): void {
  this.showEvaluateModal = false;
  this.selectedReportForEvaluate = undefined;
}

openImagePreview(url?: string | null): void {
  if (!url) return;
  this.previewImageUrl = url;
}

closeImagePreview(): void {
  this.previewImageUrl = null;
}

  // 🚀 Lifecycle
  ngOnInit(): void {
    this.loadReports();

    const notiSub = this.reportService.notifications$.subscribe(noti => {
      // ✅ Dùng setTimeout để tránh ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.notifications = noti;
        this.unreadCount = this.reportService.getUnreadCount();
        this.cdr.detectChanges();
      });
    });
    this.subs.push(notiSub);
  }

  // 📄 Mở chi tiết
  openDetail(id: number): void {
    this.reportService.getReportsById(id).subscribe({
      next: res => {
        this.selectedReport = res;
        setTimeout(() => this.showDetailModal = true);
      },
      error: err => console.error(err)
    });
  }

  closeModal(): void {
    this.showDetailModal = false;
    this.selectedReport = undefined;
  }

  // 🔄 Tải lại danh sách
  loadReports(): void {
    this.reportService.getReports().subscribe({
      next: res => {
        this.reports = res;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('❌ Lỗi khi tải danh sách báo cáo:', err);
      }
    });
  }

  // 🔍 Xem báo cáo cụ thể (nếu cần)
  viewReport(id: number): void {
    this.reportService.getReportsById(id).subscribe({
      next: res => {
        this.selectedReport = res;
        setTimeout(() => {
      this.showDetailModal = true;
    });
      },
      error: err => console.error('❌ Lỗi khi tải chi tiết báo cáo:', err)
    });
  }

  // 🧩 Đánh giá báo cáo
evaluateReport(id: number): void {
  this.reportService.evaluteReport(id, this.evaluation).subscribe({
    next: res => {
      this.toast.success(res.message);
      this.showEvaluateModal = false;
      this.loadReports();
    },
    error: err => console.error('Lỗi khi đánh giá báo cáo:', err)
  });
}


  // 👷‍♂️ Popup giao việc
  openAssignModal(report: Reports): void {
    this.selectedReportForAssign = report;
    this.showAssignModal = true;
    this.technicianId = '';
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.selectedReportForAssign = undefined;
    this.technicianId = '';
  }

  assignTechnician(id: number): void {
    if (!this.technicianId.trim()) {
      this.toast.warning('⚠️ Vui lòng nhập ID của kỹ thuật viên!');
      return;
    }

    this.reportService.assignTechnician(id, this.technicianId).subscribe({
      next: res => {
        this.toast.success(res.message);
        this.closeAssignModal(); 

      this.loadReports();

      },
      error: err => {
        console.error('❌ Lỗi khi giao việc:', err);
        this.toast.error('Không thể giao việc. Vui lòng thử lại!');
      }
    });
  }

  // 🚫 Đóng báo cáo
  closeReport(id: number): void {
    this.reportService.closeReport(id).subscribe({
      next: res => {
        this.toast.success(res.message);
        this.loadReports();
      },
      error: err => console.error('❌ Lỗi khi đóng báo cáo:', err)
    });
  }

  // 🧹 Cleanup
  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
