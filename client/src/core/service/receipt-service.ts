import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PaginatedResult,
  ReceiptDetailsDto,
  ReceiptSummaryDto,
} from '../../_models/receipt';


@Injectable({ providedIn: 'root' })
export class ReceiptService {
  //  Base URL lấy từ environment để dễ cấu hình khi deploy
  private baseUrl = 'https://localhost:5001/api/receipts';

  constructor(private http: HttpClient) {}

  /**
   * Lấy danh sách hóa đơn (phân trang cho user hiện tại)
   * @param pageNumber Số trang (default = 1)
   * @param pageSize Kích thước trang (default = 5)
   */
  getUserReceipts(pageNumber = 1, pageSize = 5): Observable<PaginatedResult<ReceiptSummaryDto>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    console.log('🔍 Calling API:', `${this.baseUrl}?${params.toString()}`);
    return this.http.get<PaginatedResult<ReceiptSummaryDto>>(this.baseUrl, { params });
  }

  /**
   * (Admin/Staff) Lấy tất cả hóa đơn - nếu có endpoint riêng
   */
  getAllReceipts(): Observable<ReceiptSummaryDto[]> {
    return this.http.get<ReceiptSummaryDto[]>(this.baseUrl + '/all');
  }

  /**
   * Lấy chi tiết hóa đơn theo ID
   */
  getReceiptById(id: number): Observable<ReceiptDetailsDto> {
    return this.http.get<ReceiptDetailsDto>(`${this.baseUrl}/${id}`);
  }
}
