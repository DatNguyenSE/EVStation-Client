import { Component, inject, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/service/account-service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
  private account = inject(AccountService);
  protected creds: any = {}
  protected loggedIn = signal(false);

  

  login() {
    this.account.login(this.creds).subscribe({
      next: result => {
        console.log(result),
        this.loggedIn.update( x => !x ),
        this.creds ={};
      },
      error: error => alert(error.error)
    })
    // console.log(this.creds);
    // this.loggedIn.update(x => !x);
  }

  logout() {
    this.loggedIn.set(!this.loggedIn);
  }
}
