import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { assignments } from '../../_models/assgin';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
    private http = inject(HttpClient);
  private baseUrl = 'https://localhost:5001/api';

  assgin(assignments: assignments){
      return this.http.post(`${this.baseUrl}/assignments`,assignments)
  }
}
