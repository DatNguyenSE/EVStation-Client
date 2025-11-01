import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CancelRequestDto,
  PaginatedResult,
  ReceiptDetailsDto,
  ReceiptFilterParams,
  ReceiptSummaryDto,
  RefundRequestDto,
} from '../../_models/receipt';
import { ReceiptDetail } from '../../features/receipt-detail/receipt-detail';

@Injectable({ providedIn: 'root' })
export class ReceiptService {
  // 📌 Base URL lấy từ environment để dễ cấu hình khi deploy
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

  getAdminReceipts(
    pageNumber = 1,
    pageSize = 10,
    filter?: ReceiptFilterParams
  ): Observable<PaginatedResult<ReceiptSummaryDto>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    // ✅ Thêm các tham số filter nếu có
    if (filter) {
      if (filter.status) params = params.set('status', filter.status);
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.appUserName) params = params.set('appUserName', filter.appUserName);
      if (filter.isWalkInOnly !== undefined)
        params = params.set('isWalkInOnly', filter.isWalkInOnly);
    }

    console.log('📤 API Call:', `${this.baseUrl}/admin?${params.toString()}`);

    return this.http.get<PaginatedResult<ReceiptSummaryDto>>(`${this.baseUrl}/admin`, { params });
  }

  getAdminReceiptById(id: number): Observable<ReceiptDetailsDto> {
    return this.http.get<ReceiptDetailsDto>(`${this.baseUrl}/admin/${id}`);
  }

  // Hủy biên lai
  cancelReceipt(id: number, dto: CancelRequestDto) {
    return this.http.post<void>(`${this.baseUrl}/${id}/cancel`, dto);
  }

  // Hoàn tiền (admin-only)
  issueRefund(refundRequest: RefundRequestDto) {
    return this.http.post(`${this.baseUrl}/refund`, refundRequest, { responseType: 'text' });
  }
}
