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
        if ((this.accountService.currentAccount()?.roles)?.includes('Admin')) { 
          window.location.href ='/quan-tri-vien/trang-chu';
        }else  if((this.accountService.currentAccount()?.roles)?.includes('Operator')){
          window.location.href = '/nhan-vien-tram/trang-chu';
        }else  if((this.accountService.currentAccount()?.roles)?.includes('Technician')){
          window.location.href = '/nhan-vien-ky-thuat/cong-viec';
        }
        else{
          window.location.href = '/';
        }
        
      },
      error: err => {
        console.error('Error:', err.error);
        if(err.status === 0) {
          this.toast.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
          return;
        }
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
