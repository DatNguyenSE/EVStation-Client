import { Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../core/service/account-service';
import { ToastService } from '../../../core/service/toast-service';
import { RegisterCreds } from '../../../_models/user';
import { Router } from '@angular/router';

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
  showConfirmMessage = false;   //  Hiện thông báo xác nhận email
  cancelRegister = output<boolean>();
  router = inject(Router);

  register() {

    this.accountService.register(this.creds).subscribe({
      next: (res: any) => {
        this.toast.success('Đăng ký thành công!');
        console.log(res);
        this.cancelRegister.emit(false);
        this.router.navigate(['/dang-nhap']);
      },
      error: (err: any) => {
        console.error('Error:', err.error);

        if (err.error?.errors) {
          const validationErrors = err.error.errors;
          for (const key in validationErrors) {
            if (validationErrors.hasOwnProperty(key)) {
              const messages = validationErrors[key];
              messages.forEach((msg: string) => this.toast.error(msg));
            }
          }
        }
        else if (Array.isArray(err.error)) {
          // ASP.NET Identity trả về mảng lỗi password
          err.error.forEach((e: any) => {
            if (e.description) {
              this.toast.error(e.description);
            } else {
              this.toast.error(JSON.stringify(e));
            }
          });
        }
        else if (typeof err.error === 'object' && err.error.message) {
          this.toast.error(err.error.message);
        }
        else if (typeof err.error === 'string') {
          this.toast.error(err.error);
        }
        else {
          this.toast.error('Đã xảy ra lỗi không xác định');
        }
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
