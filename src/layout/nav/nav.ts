import { Component, inject, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/service/account-service';
import { RouterLink, RouterLinkActive } from '@angular/router';


@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
  accountService = inject(AccountService);
  protected creds: any = {}

  logout() {
    this.accountService.logout();
  }

  

}
