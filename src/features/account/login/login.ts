import { Component, inject, output, signal } from '@angular/core';
import { AccountService } from '../../../core/service/account-service';
import { LoginCreds } from '../../../_models/user';
import { FormsModule } from '@angular/forms';
import { Register } from "../register/register";
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/service/toast-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule, Register, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  
    accountService = inject(AccountService);
    protected creds: any = {} as LoginCreds;
    protected registerMode = signal(false);
    private toast = inject(ToastService);
    showPassword: boolean = false;
    router = inject(Router);

  login() {
    this.accountService.login(this.creds).subscribe({
      next: result => {
        console.log(result),
        this.creds ={};
        this.toast.success('Đăng nhập thành công!');
        this.router.navigate(['/']);
      },
      error: error => {
        if(error.status === 0) {
          this.toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
          return;
        }
        if(error.status === 400) {
          this.toast.error('Hãy nhập "Tên đăng nhập" và "Mật khẩu".');
          return;
        }
        this.toast.error(error.error)
      }
    })

  }

   showRegister(value: boolean) {
    this.registerMode.set(value);
  }

  togglePassword() {
  this.showPassword = !this.showPassword;
}
  


}
