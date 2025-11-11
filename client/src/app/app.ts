import { Component, inject, signal } from '@angular/core';
import { Nav } from "../layout/nav/nav";
import { Footer } from "../layout/footer/footer";
import { Router, RouterOutlet } from '@angular/router';
import { AccountService } from '../core/service/account-service';
import { ReservationService } from '../core/service/reservation-service';
import { ReportService } from '../core/service/report-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Nav, RouterOutlet, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected router = inject(Router);
   
   constructor(
    private accountService: AccountService,
    private reservationService: ReservationService,
    private reportService: ReportService
  ) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('account');
    if (stored) {
      const account = JSON.parse(stored);
      this.accountService.setCurrentAccount(account);
     
      if (!this.reportService.isConnected()) {
        this.reportService.createHubConnection(account);
      }
    }
  }
  
}
