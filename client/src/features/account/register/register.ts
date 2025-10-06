import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../core/service/account-service';
import { ToastService } from '../../../core/service/toast-service';
import { RegisterCreds } from '../../../_models/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private accountService = inject(AccountService);
  private toast = inject(ToastService);

  acceptedTerms = false;
  creds = {} as RegisterCreds;
  showPassword = false;
  showConfirmMessage = false;   // 👈 Hiện thông báo xác nhận email
  cancelRegister = output<boolean>();

  register() {
    if (!this.acceptedTerms) {
      this.toast.error('Bạn phải đồng ý với điều khoản trước khi đăng ký!');
      return;
    }

    this.accountService.register(this.creds).subscribe({
      next: (res: any) => {
        if (res.requiresEmailConfirm || res.emailConfirmed === false) {
          this.showConfirmMessage = true;
          this.toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
        } else {
          this.toast.success('Đăng ký thành công!');
        }
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.toast.error(err.error || 'Đăng ký thất bại, vui lòng thử lại.');
      }
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

  openTerms(event: Event) {
    event.preventDefault();
    alert('Điều khoản sử dụng: Bạn đồng ý tuân thủ các điều kiện dịch vụ của chúng tôi.');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
