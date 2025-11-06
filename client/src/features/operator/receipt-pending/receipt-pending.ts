import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReceiptService } from '../../../core/service/receipt-service';
import { ReceiptSummaryDto, ReceiptDetailsDto } from '../../../_models/receipt';

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

  // UI state
  loading = false;
  confirming = false;
  showDetails = false;

  // Payment
  paymentMethod: string = 'Cash';
  paymentMethods = ['Cash', 'CreditCard', 'BankTransfer', 'EWallet'];

  // Alert (nếu bạn muốn hiển thị trực quan trong template)
  alertMessage: string | null = null;
  alertType: 'success' | 'error' = 'success';

  constructor(private receiptService: ReceiptService) {}

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
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách hóa đơn:', err);
        this.loading = false;
        alert('Không thể tải danh sách hóa đơn. Vui lòng thử lại sau.');
      },
    });
  }

  /** Xem chi tiết hóa đơn */
  viewDetails(id: number): void {
    this.receiptService.getAdminReceiptById(id).subscribe({
      next: (data) => {
        this.selectedReceipt = data;
        this.showDetails = true;
      },
      error: (err) => {
        console.error('Lỗi khi tải chi tiết hóa đơn:', err);
        alert('Không thể tải chi tiết hóa đơn.');
      },
    });
  }

  /** Xác nhận thanh toán */
  confirmPayment(): void {
    if (!this.selectedReceipt) return;

    const confirmText = `Xác nhận thanh toán hóa đơn #${this.selectedReceipt.id} bằng ${this.paymentMethod}?`;
    if (!confirm(confirmText)) return;

    this.confirming = true;
    this.receiptService
      .confirmPaymentByStaff(this.selectedReceipt.id, this.paymentMethod)
      .subscribe({
        next: () => {
          this.confirming = false;
          this.showDetails = false;
          this.alertMessage = '✅ Xác nhận thanh toán thành công!';
          this.alertType = 'success';
          alert(this.alertMessage);

          // Tải lại danh sách
          this.loadReceipts();
        },
        error: (err) => {
          this.confirming = false;
          console.error('Lỗi khi xác nhận thanh toán:', err);
          this.alertMessage =
            err?.error || '❌ Không thể xác nhận thanh toán. Vui lòng thử lại.';
          this.alertType = 'error';
          alert(this.alertMessage);
        },
      });
  }
}
