import { Component, inject, HostListener, signal, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/service/account-service';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { DriverService } from '../../core/service/driver-service';
import { CommonModule } from '@angular/common';
import { themes } from '../theme';
import { BusyService } from '../../core/service/busy-service';
import { ReservationService } from '../../core/service/reservation-service';
import { HasRoleDirective } from '../../core/_directive/has-role.directive';


@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [FormsModule, RouterLink, RouterLinkActive, CommonModule, HasRoleDirective],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})

export class Nav implements OnInit{
  accountService = inject(AccountService);
  protected creds: any = {}
    driverService = inject(DriverService); 
    busyService = inject(BusyService);
    routers = inject(Router);
    route = inject(ActivatedRoute)
    showBalance = signal<boolean>(false);
    reservationService = inject(ReservationService);
  
      constructor() {
    // lắng nghe currentAccount thay đổi (login/logout)
     effect(() => {
      const acc = this.accountService.currentAccount();
      if (acc) {
        // login -> load lại data
        console.log('User roles:', this.accountService.currentAccount()?.roles);
        this.driverService.loadWallet();
        this.reservationService.LoadEventReservation().subscribe({
          next: res => this.reservationService.upcomingReservations.set(res)
        });
      } else {
        // logout -> clear reservationCount
        this.reservationService.upcomingReservations.set([]);
        this.driverService.walletBalance.set(0);
      }
    });
  }

  ngOnInit(): void {
    document.documentElement.setAttribute('data-theme', this.selectedTheme());
  }
  

  logout() {
    this.accountService.logout();
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
}