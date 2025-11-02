import { inject, Injectable } from '@angular/core';
import { TransactionDto } from '../../_models/payment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
}

export interface PagedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  private baseUrl = `https://localhost:5001/api/wallet`

  getTransactions(pageNumber = 1, pageSize = 10): Observable<PagedResult<TransactionDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    // Không cần thay đổi
    return this.http.get<PagedResult<TransactionDto>>(`${this.baseUrl}/transactions`, { params });
  }
}
