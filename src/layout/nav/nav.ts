import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/service/account-service';
import { Result } from 'postcss';


@Component({
  selector: 'app-nav',
  imports: [FormsModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
  private account = inject(AccountService);
  protected creds: any = {}
  isloggin = false;

  lgoin() {
    // this.account.login(this.creds).subscribe({
    //   next: result =>  console.log(result),
    //   error: error => alert(error.message)
    // })
    console.log(this.creds);
    this.isloggin = ! this.isloggin;
  }
}
