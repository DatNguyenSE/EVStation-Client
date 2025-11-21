import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { EvaluateReportRequest, ReportFilterParams, Reports } from '../../../_models/report';
import { Subscription } from 'rxjs';
import { ReportService } from '../../../core/service/report-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ToastService } from '../../../core/service/toast-service';
import { PaginatedResult } from '../../../_models/receipt';

@Component({
  selector: 'app-report',
  imports: [CommonModule, FormsModule],
  templateUrl: './report.html',
  styleUrl: './report.css',
})
export class Report {

  reportService = inject(ReportService);
  private cdr = inject(ChangeDetectorRef);
  toast = inject(ToastService);

  // Data
  reports: Reports[] = [];

  filterParams: ReportFilterParams = {
    pageNumber: 1,
    pageSize: 10,    
    postCode: '',
    technicianId: '',
    status: '',
    severity: '',
    fromDate: '',
    toDate: ''
  };

  // Lưu trữ thông tin phân trang trả về từ Server
  paginationConfig: PaginatedResult<Reports> | null = null;

  statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'New', label: 'Mới (New)' },
    { value: 'Pending', label: 'Đang chờ (Pending)' },
    { value: 'InProgress', label: 'Đang xử lý (InProgress)' },
    { value: 'Resolved', label: 'Đã xử lý (Resolved)' },
    { value: 'Closed', label: 'Đã đóng (Closed)' }
  ];

  severityOptions = [
    { value: '', label: 'Tất cả mức độ' },
    { value: 'Normal', label: 'Bình thường (Normal)' },
    { value: 'Critical', label: 'Nghiêm trọng (Critical)' }
  ];

  onSearch(): void {
    // Khi bấm tìm kiếm, luôn reset về trang 1 để tránh lỗi (vd: đang ở trang 5 mà filter xong chỉ còn 1 trang)
    this.filterParams.pageNumber = 1; 
    this.loadReports();
  }

  onReset(): void {
    // Reset filter về mặc định
    this.filterParams = {
      pageNumber: 1,
      pageSize: 10,
      postCode: '',
      technicianId: '',
      status: '',
      severity: '',
      fromDate: '',
      toDate: ''
    };
    this.loadReports();
  }

  selectedReport?: Reports;
  notifications: any[] = [];
  unreadCount = 0;

  // Popup flags
  showDetailModal = false;
  showAssignModal = false;
  showEvaluateModal = false;

  // Giao việc
  technicianId = '';
  selectedReportForAssign?: Reports;

  // Đánh giá
  evaluation: EvaluateReportRequest = {
    isCritical: false,
    maintenanceStartTime: '',
    maintenanceEndTime: ''
  };
  selectedReportForEvaluate?: Reports;

  // xem ảnh 
  previewImageUrl: string | null = null;

  private subs: Subscription[] = [];

  //  Lifecycle
  ngOnInit(): void {
    this.filterParams.pageNumber = 1;
    this.loadReports();
  }

  // Tải danh sách
  loadReports(): void {
    this.reportService.getReports(this.filterParams).subscribe({
      next: (res: any) => { // <-- Để any tạm thời để truy cập thuộc tính pagination
        
        // 1. Gán dữ liệu vào danh sách
        this.reports = res.items; 

        // 2. Gán metadata phân trang (Mapping thủ công do lệch tên biến)
        if (res.pagination) {
          this.paginationConfig = {
            items: res.items,
            // Backend trả về 'currentPage', Frontend đang dùng 'pageNumber'
            pageNumber: res.pagination.currentPage, 
            
            // Backend trả về 'totalPages', Frontend đang dùng 'pageCount'
            pageCount: res.pagination.totalPages,   
            
            pageSize: res.pagination.pageSize,
            totalItemCount: res.pagination.totalCount
          };
        }
        
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Lỗi khi tải danh sách báo cáo:', err);
        this.toast.error('Không thể tải dữ liệu báo cáo');
      }
    });
  }

  // Hàm chuyển trang
  changePage(newPage: number): void {
    // if (!this.paginationConfig) return;
    
    // // Kiểm tra giới hạn trang
    // if (newPage < 1 || newPage > this.paginationConfig.pageCount) return;
    if (!newPage || isNaN(newPage) || newPage < 1) return;

    // Cập nhật filter và gọi lại API
    this.filterParams.pageNumber = newPage;
    this.loadReports();
  }

  openEvaluateModal(report: Reports): void {
    this.selectedReportForEvaluate = report;
    console.log('Opening evaluate modal for report:', report);
    this.selectedReportForEvaluate = report;
    this.showEvaluateModal = true;
    console.log('showEvaluateModal:', this.showEvaluateModal);
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

  // 📄 Mở chi tiết
  openDetail(id: number): void {
    this.reportService.getReportsById(id).subscribe({
      next: res => {
        this.selectedReport = res;
        setTimeout(() => {
          this.showDetailModal = true;
           this.cdr.detectChanges();
        },0) ;
      },
      error: err => console.error(err)
    });
  }

  closeModal(): void {
    this.showDetailModal = false;
    this.selectedReport = undefined;
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
      error: err => console.error('Lỗi khi tải chi tiết báo cáo:', err)
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


  //  Popup giao việc
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
        console.error(' Lỗi khi giao việc:', err);
        // this.toast.error('Không thể giao việc. Vui lòng thử lại!');
      }
    });
  }

  // 🚫 Đóng báo cáo
  closeReport(id: number): void {
    this.reportService.closeReport(id).subscribe({
      next: res => {
        this.toast.success(res.message);
        this.loadReports();
        this.reportService.loadReportsAdmin();
      },
      error: err => console.error('Lỗi khi đóng báo cáo:', err)
    });
  }
   getInProgressCount(): number {
    return this.reports.filter(r => r.status === 'InProgress').length;
  }

  getCriticalCount(): number {
    return this.reports.filter(r => r.severity === 'Critical').length;
  }

  getClosedCount(): number {
    return this.reports.filter(r => r.status === 'Closed').length;
  }


  // 🧹 Cleanup
  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
