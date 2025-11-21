import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ReceiptDetailsDto } from '../../../_models/receipt';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReceiptService } from '../../../core/service/receipt-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-receip-detail-manager',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './receip-detail-manager.html',
  styleUrl: './receip-detail-manager.css',
})
export class ReceipDetailManager implements OnInit{
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private receiptService = inject(ReceiptService);
  private cdr = inject(ChangeDetectorRef);
  
  // Manager không cần ToastService để báo lỗi hoàn tiền/hủy vì không có chức năng đó
  // Nhưng có thể giữ lại nếu muốn báo lỗi load dữ liệu

  receipt?: ReceiptDetailsDto;
  isLoading = true;
  errorMessage = '';


  ngOnInit(): void {
    const idRaw = this.route.snapshot.paramMap.get('id');
    const id = idRaw ? Number(idRaw) : NaN;
    if (isNaN(id)) {
      this.errorMessage = 'Mã biên lai không hợp lệ.';
      this.isLoading = false;
      return;
    }

    this.loadDetail(id);
  }

  private loadDetail(id: number) {
    this.isLoading = true;
    // Manager vẫn gọi API lấy chi tiết (Backend cần đảm bảo Manager có quyền gọi API này)
    this.receiptService.getAdminReceiptById(id).subscribe({
      next: (res) => {
        this.receipt = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Không tìm thấy biên lai hoặc bạn không quản lý trạm này.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/quan-ly-tram/bien-lai']); 
  }
}
