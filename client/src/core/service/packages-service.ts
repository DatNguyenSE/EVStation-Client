import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Package } from '../../_models/user';

@Injectable({
  providedIn: 'root'
})
export class PackagesService {

  private http = inject(HttpClient); // Dùng inject() thay vì constructor
  private baseUrl = 'https://localhost:5001/api';

  // Lấy danh sách package
  getPackages(): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.baseUrl}/charging-package`)
      
  }
}
