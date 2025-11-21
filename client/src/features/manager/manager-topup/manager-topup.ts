import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ManualTopUpDto } from '../../../_models/payment';
import { PaymentService } from '../../../core/service/payment-service';
import { ToastService } from '../../../core/service/toast-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-manager-topup',
  imports: [CommonModule, FormsModule],
  templateUrl: './manager-topup.html',
  styleUrl: './manager-topup.css',
})
export class ManagerTopup implements OnInit {

  topUpModel: ManualTopUpDto = {
    driverUserName: '',
    amount: 0
  };

  isLoading = false;
  quickAmounts = [50000, 100000, 200000, 500000];

  constructor(
    private walletService: PaymentService,
    private toastr: ToastService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
  }

  // Hàm chọn nhanh số tiền
  selectAmount(value: number) {
    this.topUpModel.amount = value;
  }

  onSubmit() {
    if (!this.topUpModel.driverUserName) {
      this.toastr.warning('Vui lòng nhập Username người dùng');
      return;
    }
    if (this.topUpModel.amount < 10000) {
      this.toastr.warning('Số tiền nạp tối thiểu là 10,000đ');
      return;
    }

    // Confirm trước khi nạp (Tránh bấm nhầm)
    if(!confirm(`Xác nhận nạp ${this.topUpModel.amount.toLocaleString()}đ cho tài khoản ${this.topUpModel.driverUserName}?`)){
      return;
    }

    this.isLoading = true;

    this.walletService.manualTopUp(this.topUpModel)
      .pipe(
        finalize(() => {
          console.log("Finalize đã chạy!"); // <--- Log kiểm tra
          this.isLoading = false;
          this.cdr.detectChanges(); 
        })
      )
      .subscribe({
        next: (response: any) => {
          // Xử lý khi thành công
          this.toastr.success(response?.message || 'Nạp tiền thành công!'); 
          
          // Reset form về 0
          setTimeout(() => {
            this.topUpModel = { driverUserName: '', amount: 0 };
          }, 0);
        },
        error: (err: any) => {
          // Xử lý khi lỗi
          console.error(err); // Log lỗi ra để kiểm tra
          const errorMsg = err.error?.message || 'Có lỗi xảy ra khi nạp tiền';
          this.toastr.error(errorMsg);
        }
      });
  }
}
