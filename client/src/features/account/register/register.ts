import { Component, inject, output, signal } from '@angular/core';
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
  validationErrors = signal<string[]>([]);


  register() {

    this.accountService.register(this.creds).subscribe({
      next: (res: any) => {
        this.toast.success('Đăng ký thành công!');
        console.log(res);
        this.cancelRegister.emit(false);
        this.router.navigate(['/dang-nhap']);
      }
    });
  }

  cancel() {
    this.cancelRegister.emit(false);
  }
  formatDateInput() {
    const value = this.creds.dateOfBirth;
    const parts = value.split(/[\/\-]/);
    if (parts.length === 3) {
      const [day, month, year] = parts;
      this.creds.dateOfBirth = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    }
  }
  openTerms(event: Event) {
    event.preventDefault();
    alert('Điều khoản sử dụng: Bạn đồng ý tuân thủ các điều kiện dịch vụ của chúng tôi, xem thêm.');
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
