import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Payment } from '../../_models/user';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private baseUrl = `https://localhost:5001/api`;
  
  topUp(s:Payment){
     return this.http.post<Payment>(`${this.baseUrl}/wallet/topup`,s);
  }

}
