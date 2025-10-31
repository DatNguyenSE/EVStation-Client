import { Component, inject, HostListener, signal, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/service/account-service';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DriverService } from '../../core/service/driver-service';
import { CommonModule } from '@angular/common';
import { themes } from '../theme';
import { BusyService } from '../../core/service/busy-service';
import { ReservationService } from '../../core/service/reservation-service';
import { HasRoleDirective } from '../../shared/_directive/has-role.directive';
import { InitService } from '../../core/service/init-service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive, CommonModule, HasRoleDirective],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})

export class Nav implements OnInit {
  menuItems: { label: string; link: string }[] = [];

  accountService = inject(AccountService);
  protected creds: any = {}
  driverService = inject(DriverService);
  busyService = inject(BusyService);
  routers = inject(Router);
  route = inject(ActivatedRoute)
  showBalance = signal<boolean>(false);
  reservationService = inject(ReservationService);


  ngOnInit(): void {
    document.documentElement.setAttribute('data-theme', this.selectedTheme());
    const role = this.accountService.currentAccount()?.roles?.[0] || '';
    this.menuItems = this.getMenuForRole(role);
  }

  
  /* Lấy danh sách menu theo role hiện tại */

  getMenuForRole(role: string) {
    const menus: Record<string, { label: string; link: string }[]> = {
      Driver: [
        { label: 'Dịch vụ', link: '/dich-vu' },
        { label: 'Thanh toán', link: '/thanh-toan' },
        { label: 'Sự kiện', link: '/su-kien' },
      ],
      Admin: [
        { label: 'Bảng điều khiển', link: '/dashboard' },
        { label: 'Quản lý tài xế', link: '/quan-ly-tai-xe' },
        { label: 'Quản lý trạm sạc', link: '/quan-ly-tram' },
        { label: 'Giao dịch', link: '/lich-su-giao-dich' },
        { label: 'Báo cáo', link: '/bao-cao' },
      ],
    };
    return menus[role] ?? [];
  }

  

  onLogoClick() {
    const acc = this.accountService.currentAccount()?.roles;
    if (acc?.includes('Admin')) {
      window.location.href = '/quan-tri-vien';
    } else if (acc?.includes('Staff')) {
      window.location.href = '/#';
    } else {
      window.location.href = '/';
    }
  }

  logout() {
    this.reservationService.upcomingReservations.set([]);
    this.driverService.walletBalance.set(0);
    this.accountService.logout();
  }

  toggleBalance() {
    this.showBalance.update((v) => !v);
  }

  protected selectedTheme = signal<string>(localStorage.getItem('theme') || 'light');
  protected themes = themes;

  handleSelectedTheme(theme: string) {
    this.selectedTheme.set(theme);
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }


  // thêm biến quản lý menu mobile
  isMenuOpen = false;
  isMobile = window.innerWidth < 640; // sm:640px 

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