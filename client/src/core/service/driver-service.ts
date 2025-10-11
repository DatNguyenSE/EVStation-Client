import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Driver, User } from '../../_models/user';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private http = inject(HttpClient);
  protected router = inject(Router);
  baseUrl = 'https://localhost:5001/api/';
  currentDriver = signal<Driver | null>(null);

  //  Hàm lấy token từ localStorage  \\\ Option?[headers params responseType observe]
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        Authorization: token ? `Bearer ${token}` : ''
      })
    };
  }

  GetProfile_Driver() {
    return this.http.get<Driver>(
      `${this.baseUrl}users/profile-driver`,
      this.getAuthHeaders()
    );
  }
}
