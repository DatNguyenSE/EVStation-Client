import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Payments } from '../../_models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private baseUrl = `https://localhost:5001/api`;
  
 topUp(payment: Payments) {
    return this.http.post<{ paymentUrl: string }>(`${this.baseUrl}/wallet/top-up`, payment);
  }
   vnpayreturn(params: any) {
  const queryString = new URLSearchParams(params).toString();
  return this.http.get<{ message: string; data?: any }>(
    `${this.baseUrl}/wallet/vnpay-return?${queryString}`
  );
}

}
