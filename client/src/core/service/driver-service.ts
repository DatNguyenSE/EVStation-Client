import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Driver } from '../../_models/user';
import { Vehicles } from '../../_models/vehicle';


@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private http = inject(HttpClient);
  protected router = inject(Router);
  baseUrl = 'https://localhost:5001/api/';

  currentDriver = signal<Driver | null>(null);
  walletBalance = signal<number>(0);



  loadDriverProfile() {
    this.http.get<Driver>(
      `${this.baseUrl}users/profile-driver`).subscribe({
        next: (driver) => {
          this.currentDriver.set(driver);
        },
        error: (err) => {
          console.error('Không thể tải thông tin tài xế:', err);
        }
      });
  }

  GetVehicles() {
    return this.http.get<Vehicles[]>(
      `${this.baseUrl}vehicle/my`);
  }

  GetVehiclesApproved() {
    return this.http.get<Vehicles[]>(
      `${this.baseUrl}vehicle/my-approved`);
  }

  loadWallet() {
    this.http.get<{ balance: number }>(`${this.baseUrl}wallet/me`).subscribe({
      next: (res) => {
        this.walletBalance.set(res.balance);
      }
    });
  }
 
  loadDriverResolver() {
    return this.http.get<Driver>(
      `${this.baseUrl}users/profile-driver`)
  }
  

  getAllDriver(){
    return this.http.get<Driver[]>(`${this.baseUrl}account/drivers`);
  }

 banDriver(userId: string, days: number) {
   console.log('Gửi request banUser:', userId, days);
  return this.http.post(`${this.baseUrl}account/BanUser/${userId}?days=${days}`, {});
}


  
}
