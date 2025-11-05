import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReceiptService } from '../../../../core/service/receipt-service';
import { ReceiptDetailsDto } from '../../../../_models/receipt';
import { FormsModule } from '@angular/forms';
import { clearHttpCache } from '../../../../core/interceptors/loading-interceptor';
import { ToastService } from '../../../../core/service/toast-service';

@Component({
  selector: 'app-receipt-detail',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './receipt-detail.html',
  styleUrl: './receipt-detail.css',
})
export class ReceiptDetailAdmin implements OnInit{
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private receiptService = inject(ReceiptService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);

  receipt?: ReceiptDetailsDto;
  isLoading = true;
  errorMessage = '';

  cancelReason = '';
  refundAmount = 0;
  refundReason = '';

  @ViewChild('cancelDialog') cancelDialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('refundDialog') refundDialog!: ElementRef<HTMLDialogElement>;

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
    this.receiptService.getAdminReceiptById(id).subscribe({
      next: (res) => {
        this.receipt = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Không tìm thấy biên lai hoặc không có quyền truy cập.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/quan-tri-vien/bien-lai']);
  }

  // ===== HỦY =====
  openCancelModal() {
    this.cancelDialog.nativeElement.showModal();
  }

  closeCancelModal() {
    this.cancelDialog.nativeElement.close();
  }

  confirmCancel() {
    if (!this.receipt) return;
    if (!this.cancelReason.trim()) return this.toast.warning('Vui lòng nhập lý do.');

    this.receiptService.cancelReceipt(this.receipt.id, { reason: this.cancelReason }).subscribe({
      next: () => {
        this.toast.success('Đã hủy hóa đơn thành công.');
        clearHttpCache();
        this.router.navigate(['/quan-tri-vien/bien-lai'], { queryParams: { refresh: Date.now() } });
      },
      error: (err) => {
        console.error(err);
        this.toast.error('Không thể hủy hóa đơn.');
      },
    });
  }

  // ===== HOÀN TIỀN =====
  openRefundModal() {
    this.refundDialog.nativeElement.showModal();
  }

  closeRefundModal() {
    this.refundDialog.nativeElement.close();
  }

  confirmRefund() {
    if (!this.receipt) return;
    if (this.refundAmount <= 0) return this.toast.warning('Vui lòng nhập số tiền hợp lệ.');
    if (!this.refundReason.trim()) return this.toast.warning('Vui lòng nhập lý do hoàn tiền.');

    this.receiptService
      .issueRefund({
        receiptId: this.receipt.id,
        amount: this.refundAmount,
        reason: this.refundReason,
      })
      .subscribe({
        next: () => {
          this.toast.success('Hoàn tiền thành công.');
          clearHttpCache();
          this.router.navigate(['/quan-tri-vien/bien-lai'], { queryParams: { refresh: Date.now() } });
        },
        error: (err: any) => {
          console.error(err);
          this.toast.error('Không thể hoàn tiền.');
        },
      });
  }
}
