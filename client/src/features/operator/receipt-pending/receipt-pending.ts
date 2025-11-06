import { Component, OnInit, ChangeDetectorRef, Inject, inject } from '@angular/core'; // Thêm ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReceiptService } from '../../../core/service/receipt-service';
import { ReceiptSummaryDto, ReceiptDetailsDto } from '../../../_models/receipt';
import { ToastService } from '../../../core/service/toast-service';

@Component({
  selector: 'app-receipt-pending',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './receipt-pending.html',
  styleUrl: './receipt-pending.css',
})
export class ReceiptPending implements OnInit {
  receipts: ReceiptSummaryDto[] = [];
  selectedReceipt?: ReceiptDetailsDto;
  private toast = inject(ToastService);

  // UI state
  loading = false;
  confirming = false;
  showDetails = false;

  // Payment
  paymentMethod: string = 'Cash';
  paymentMethods = ['Cash', 'CreditCard', 'BankTransfer', 'EWallet'];

  // Alert
  alertMessage: string | null = null;
  alertType: 'success' | 'error' = 'success';

  constructor(
    private receiptService: ReceiptService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReceipts();
  }

  /** Tải danh sách hóa đơn chờ xác nhận */
  loadReceipts(): void {
    this.loading = true;
    this.receiptService.getPendingReceipt().subscribe({
      next: (data) => {
        this.receipts = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách hóa đơn:', err);
        this.toast.error('Lỗi khi tải danh sách hóa đơn:', err);
        this.loading = false;
        // Cân nhắc hiển thị lỗi này trên UI thay vì alert
        this.cdr.detectChanges();
      },
    });
  }

  /** Xem chi tiết hóa đơn */
  viewDetails(id: number): void {
    this.alertMessage = null; // Reset alert cũ
    this.receiptService.getAdminReceiptById(id).subscribe({
      next: (data) => {
        this.selectedReceipt = data;
        this.showDetails = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải chi tiết hóa đơn:', err);
        this.toast.error('Không thể tải chi tiết hóa đơn.');
      },
    });
  }
  
  closeDetails(): void {
    this.showDetails = false;
    this.alertMessage = null; 
    this.cdr.detectChanges();
  }

  confirmPayment(): void {
    if (!this.selectedReceipt) return;

    const confirmText = `Xác nhận thanh toán hóa đơn #${this.selectedReceipt.id} bằng ${this.paymentMethod}?`;
    if (!confirm(confirmText)) return;

    this.confirming = true;
    this.cdr.detectChanges();

    const confirmedReceiptId = this.selectedReceipt.id;

    this.receiptService
      .confirmPaymentByStaff(this.selectedReceipt.id, this.paymentMethod)
      .subscribe({
        next: () => {
          this.confirming = false;
          this.loadReceipts(); 
          
          this.toast.success("Xác nhận thanh toán thành công!");
          this.receipts = this.receipts.filter(r => r.id !== confirmedReceiptId);
          this.cdr.detectChanges();

          // Đóng panel sau một khoảng trễ nhỏ để người dùng thấy xác nhận thành công
          setTimeout(() => {
            this.closeDetails();
          }, 1500); // 1.5 giây

        },
        error: (err) => {
          this.confirming = false;
          console.error('Lỗi khi xác nhận thanh toán:', err);
          this.toast.error("Không thể xác nhận thanh toán. Vui lòng thử lại.");
          this.cdr.detectChanges();
        },
      });
  }
}