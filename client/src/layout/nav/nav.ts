import { Component, inject, HostListener, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/service/account-service';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DriverService } from '../../core/service/driver-service';
import { CommonModule } from '@angular/common';
import { eventReservation } from '../../_models/station';
import { themes } from '../theme';
import { BusyService } from '../../core/service/busy-service';

@Component({
  selector: 'app-nav',
  imports: [FormsModule, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})

export class Nav implements OnInit{
  accountService = inject(AccountService);
  protected creds: any = {}
    driverService = inject(DriverService); 
    busyService = inject(BusyService);
    reservations = signal<eventReservation[] | null> (null);
    routers = inject(Router);
    route = inject(ActivatedRoute)
    showBalance = signal<boolean>(false);

    
  ngOnInit(): void {
    this.driverService.loadWallet();
    this.GetEventReservation();
    document.documentElement.setAttribute('data-theme', this.selectedTheme());

  }
  
  GetEventReservation(){
    this.driverService.GetEventReservation().subscribe({
      next: res => this.reservations.set(res)
    })
  }

  logout() {
    this.accountService.logout();
    this.routers.navigateByUrl('/' );
  }

   toggleBalance() {
    this.showBalance.update((v) => !v);
  }

  protected selectedTheme = signal<string>(localStorage.getItem('theme') || 'light');
    protected themes = themes;

    handleSelectedTheme(theme: string){
      this.selectedTheme.set(theme);
      localStorage.setItem('theme',theme);
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

   showNotification = false;

  notifications = [
    { message: "Bạn được mời tham gia cuộc họp 'Phiên họp check trùng 2' vào 14/10/2025 10:15 - 12:15.", time: '08:53 15/10/2025' },
    { message: "Bạn được mời tham gia cuộc họp 'Phiên họp test trùng 1' vào 14/10/2025 10:14 - 12:14.", time: '04:16 14/10/2025' },
  ];

  toggleNotification() {
    this.showNotification = !this.showNotification;
  }

  closeNotification() {
    this.showNotification = false;
  }

  removeNotification(item: any) {
    this.notifications = this.notifications.filter(n => n !== item);
  }

  clearAll() {
    this.notifications = [];
  }
}