// src/app/receipt/receipt.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CancelRequestDto,
  ConfirmPaymentRequestDto,
  PaginatedResult,
  PagingParams,
  ReceiptDetailsDto,
  ReceiptDto,
  ReceiptFilterParams,
  ReceiptSummaryDto,
  RefundRequestDto
} from '../../_models/receipt';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  // Route cơ bản từ C# [Route("api/receipts")]
  private apiUrl = '/api/receipts'; 

  constructor(private http: HttpClient) { }

  // === USER ENDPOINTS ===

  /**
   * [USER] Lấy lịch sử hóa đơn (đã phân trang) của người dùng hiện tại.
   * Tương ứng với: GetUserReceipts([FromQuery] PagingParams pagingParams)
   */
  getUserReceipts(paging: PagingParams): Observable<PaginatedResult<ReceiptDto>> {
    let params = new HttpParams()
      .set('PageNumber', paging.PageNumber.toString())
      .set('PageSize', paging.PageSize.toString());
      
    // API trả về PaginatedResult<ReceiptDto>
    return this.http.get<PaginatedResult<ReceiptDto>>(this.apiUrl, { params });
  }

  /**
   * [USER] Lấy chi tiết một hóa đơn CỦA CHÍNH người dùng hiện tại.
   * Tương ứng với: GetReceiptDetails(int id)
   */
  getReceiptDetails(id: number): Observable<ReceiptDetailsDto> {
    // API trả về ReceiptDetailsDto
    return this.http.get<ReceiptDetailsDto>(`${this.apiUrl}/${id}`);
  }

  // === ADMIN/STAFF ENDPOINTS ===

  /**
   * [STAFF] Xác nhận thanh toán (tiền mặt/thẻ) cho hóa đơn của khách vãng lai.
   * Tương ứng với: ConfirmPaymentByStaff(int id, [FromBody] ConfirmPaymentRequestDto dto)
   */
  confirmPaymentByStaff(id: number, dto: ConfirmPaymentRequestDto): Observable<void> {
    // API trả về NoContent() (HTTP 204)
    return this.http.post<void>(`${this.apiUrl}/${id}/confirm-payment-by-staff`, dto);
  }

  /**
   * [ADMIN/STAFF] Hủy một hóa đơn đang ở trạng thái Pending.
   * Tương ứng với: CancelReceipt(int id, [FromBody] CancelRequestDto dto)
   */
  cancelReceipt(id: number, dto: CancelRequestDto): Observable<void> {
    // API trả về NoContent() (HTTP 204)
    return this.http.post<void>(`${this.apiUrl}/${id}/cancel`, dto);
  }

  /**
   * [ADMIN] Thực hiện hoàn tiền cho một hóa đơn đã thanh toán.
   * Tương ứng với: IssueRefund([FromBody] RefundRequestDto refundRequest)
   */
  issueRefund(dto: RefundRequestDto): Observable<string> {
    // API trả về Ok("Hoàn tiền thành công.") -> responseType: 'text'
    return this.http.post(`${this.apiUrl}/refund`, dto, { responseType: 'text' });
  }

  /**
   * [ADMIN/STAFF] Lấy TẤT CẢ hóa đơn trong hệ thống (có lọc, phân trang).
   * Tương ứng với: GetAllReceiptsForAdmin([FromQuery] ReceiptFilterParams filterParams, [FromQuery] PagingParams pagingParams)
   */
  getAllReceiptsForAdmin(filter: ReceiptFilterParams, paging: PagingParams): Observable<PaginatedResult<ReceiptSummaryDto>> {
    
    // Xây dựng HttpParams
    let params = new HttpParams()
      .set('PageNumber', paging.PageNumber.toString())
      .set('PageSize', paging.PageSize.toString());

    // Thêm các tham số filter (chỉ thêm nếu chúng có giá trị)
    if (filter.Status) {
      params = params.set('Status', filter.Status);
    }
    if (filter.StartDate) {
      params = params.set('StartDate', filter.StartDate);
    }
    if (filter.EndDate) {
      params = params.set('EndDate', filter.EndDate);
    }
    if (filter.IsWalkInOnly !== null && filter.IsWalkInOnly !== undefined) {
      params = params.set('IsWalkInOnly', filter.IsWalkInOnly.toString());
    }
    if (filter.StationId) {
      params = params.set('StationId', filter.StationId.toString());
    }
    if (filter.SearchTerm) {
      params = params.set('SearchTerm', filter.SearchTerm);
    }

    // API trả về PaginatedResult<ReceiptSummaryDto>
    return this.http.get<PaginatedResult<ReceiptSummaryDto>>(`${this.apiUrl}/admin`, { params });
  }

  /**
   * [ADMIN/STAFF] Lấy chi tiết một hóa đơn BẤT KỲ theo ID.
   * Tương ứng với: GetReceiptByIdForAdmin(int id)
   */
  getReceiptByIdForAdmin(id: number): Observable<ReceiptDetailsDto> {
    // API trả về ReceiptDetailsDto
    return this.http.get<ReceiptDetailsDto>(`${this.apiUrl}/admin/${id}`);
  }
}