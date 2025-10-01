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

   // thêm biến quản lý menu mobile
  isMenuOpen = false;
  isMobile = window.innerWidth < 640; // sm:640px trong Tailwind

  // lắng nghe resize để cập nhật lại isMobile
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = (event.target as Window).innerWidth < 640;
    // nếu lên desktop thì auto đóng menu
    if (!this.isMobile) {
      this.isMenuOpen = false;
    }
  }
}
