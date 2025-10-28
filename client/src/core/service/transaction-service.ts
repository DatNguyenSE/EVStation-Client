import { inject, Injectable } from '@angular/core';
import { TransactionDto } from '../../_models/user';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private baseUrl = `https://localhost:5001/api`

  getTransaction(){
      return this.http.get<TransactionDto[]>(`${this.baseUrl}/wallet/transactions`);
  }
}
