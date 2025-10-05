import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../core/service/account-service';
import { RegisterCreds } from '../../../_models/user';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/service/toast-service';



@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private accountService = inject(AccountService)
  acceptedTerms: boolean = false;
  // @Output() cancelRegister = new EventEmitter();
  cancelRegister = output<boolean>();   //out event         // <! pratice load data 'child to parent' -->
  protected creds = {} as RegisterCreds;
  private toast = inject(ToastService);
  showPassword: boolean = false;

  register() {

    if (!this.acceptedTerms) {
      this.toast.error("Bạn phải đồng ý với điều khoản trước khi đăng ký!");
      return;
    }

    this.accountService.register(this.creds).subscribe({
      next: response => {
        console.log(response);
      },
      error: (err: any) => {
          this.toast.error(err.error);
          console.log('Error details:', err.error);
          console.log('Form data:', this.creds);
      }

    })
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

  openTerms(event: Event) {
    event.preventDefault();
    alert("Điều khoản sử dụng: Đồng ý rằng bạn phải tuân thủ các quy định và điều kiện của chúng tôi.");
    // hoặc bạn có thể mở modal riêng để hiển thị chi tiết
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}
