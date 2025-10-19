import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Driver, DriverBalance, Vehicles } from '../../_models/user';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private http = inject(HttpClient);
  protected router = inject(Router);
  baseUrl = 'https://localhost:5001/api/';
  
  currentDriver = signal<Driver | null>(null);
  Vehicles = signal<Vehicles[] >([]);
  walletBalance = signal<number>(0);

  GetProfile_Driver() {
    return this.http.get<Driver>(
      `${this.baseUrl}users/profile-driver`);
  }

  GetVehicles() {
    return this.http.get<Vehicles[]>(
      `${this.baseUrl}vehicle/my`);
  }

   loadWallet() {
      this.http.get<{ balance: number }>(`${this.baseUrl}wallet/my`).subscribe({
        next: (res) => {
          this.walletBalance.set(res.balance);
        }
      });
  }

}
