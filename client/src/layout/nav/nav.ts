import { Component, inject, HostListener, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/service/account-service';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DriverService } from '../../core/service/driver-service';



@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav {
  accountService = inject(AccountService);
  protected creds: any = {}

    driverService = inject(DriverService); 
    routers = inject(Router);
  
  logout() {
    this.accountService.logout();
    this.routers.navigateByUrl('/' );
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
