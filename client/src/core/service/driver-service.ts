import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Driver, Vehicles } from '../../_models/user';
import { eventReservation } from '../../_models/station';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private http = inject(HttpClient);
  protected router = inject(Router);
  baseUrl = 'https://localhost:5001/api/';
  
  currentDriver = signal<Driver | null>(null);
  walletBalance = signal<number>(0);

  GetProfile_Driver() {
    return this.http.get<Driver>(
      `${this.baseUrl}users/profile-driver`);
  }

  GetVehicles() {
    return this.http.get<Vehicles[]>(
      `${this.baseUrl}vehicle/my`);
  }

  GetEventReservation() {
    return this.http.get<eventReservation[]>(`${this.baseUrl}reservation/upcoming`);
  }

  loadWallet() {
      this.http.get<{ balance: number }>(`${this.baseUrl}wallet/my`).subscribe({
        next: (res) => {
          this.walletBalance.set(res.balance);
        }
      });
  }

}
