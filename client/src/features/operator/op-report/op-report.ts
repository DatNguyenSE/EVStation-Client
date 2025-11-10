import { Component, inject } from '@angular/core';
import { ReportService } from '../../../core/service/report-service';
import { Reports } from '../../../_models/report';
import { ToastService } from '../../../core/service/toast-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-op-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './op-report.html',
  styleUrls: ['./op-report.css'],
})
export class OpReport {
  private reportSvc = inject(ReportService);
  private toast = inject(ToastService);
  private route = inject(Router)

  // State
  report: Reports = { postId: 0, description: '' } as Reports;
  selectedFile?: File;
  previewUrl?: string;
  loading = false;

  /** Khi chọn file từ input */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

 

  /** Gửi báo cáo */
  uploadReport(): void {
    if (!this.report.postId || !this.report.description) {
      this.toast.warning('Vui lòng nhập đầy đủ thông tin báo cáo');
      return;
    }

    const formData = new FormData();
    formData.append('PostId', this.report.postId.toString());
    formData.append('Description', this.report.description.trim());
    if (this.selectedFile) {
      formData.append('ImageFile', this.selectedFile);
    }

    this.loading = true;
    this.reportSvc.uploadReport(formData).subscribe({
      next: (res) => {
        this.toast.success('Gửi báo cáo thành công!');
        this.resetForm();
        setTimeout(() =>{
          this.route.navigate(['/nhan-vien-tram/trang-chu']);
        },2000);
        
      },
      error: (err) => {
        console.error('Lỗi khi gửi báo cáo:', err);
        this.toast.error('Gửi báo cáo thất bại. Vui lòng thử lại.');
      },
      complete: () => (this.loading = false),
    });
  }

  /** Reset form sau khi gửi */
  resetForm(): void {
    this.report = { postId: 0, description: '' } as Reports;
    this.selectedFile = undefined;
  }
}
