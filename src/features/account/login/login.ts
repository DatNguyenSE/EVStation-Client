import { Component, inject, output, signal } from '@angular/core';
import { AccountService } from '../../../core/service/account-service';
import { LoginCreds } from '../../../_models/user';
import { FormsModule } from '@angular/forms';
import { Register } from "../register/register";
import { CommonModule } from '@angular/common';

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
    showPassword: boolean = false;

  login() {
    this.accountService.login(this.creds).subscribe({
      next: result => {
        console.log(result),
        this.creds ={};
      },
      error: error => alert(error.error)
    })

  }

   showRegister(value: boolean) {
    this.registerMode.set(value);
  }

  togglePassword() {
  this.showPassword = !this.showPassword;
}
  


}
