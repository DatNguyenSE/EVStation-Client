import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Driver, Vehicle } from '../../_models/user';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private http = inject(HttpClient);
  protected router = inject(Router);
  baseUrl = 'https://localhost:5001/api/';
  currentDriver = signal<Driver | null>(null);
  Vehicles = signal<Vehicle[] >([]);

  GetProfile_Driver() {
    return this.http.get<Driver>(
      `${this.baseUrl}users/profile-driver`);
  }

  GetVehicles() {
    return this.http.get<Vehicle[]>(
      `${this.baseUrl}vehicle/my`);
  }
}
