import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Observable, EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { 
  PaginatedResult, 
  ReceiptDto,          // Dùng cho danh sách
  ReceiptDetailsDto,   // Dùng cho chi tiết
  PagingParams 
} from '../../_models/receipt';
import { ReceiptService } from '../../core/service/receipt-service';

@Component({
  selector: 'app-receipt',
  imports: [CommonModule],
  templateUrl: './receipt.html',
  styleUrl: './receipt.css',
})
export class Receipt implements OnInit{
  public paginatedReceipts$!: Observable<PaginatedResult<ReceiptDto>>;
  public selectedReceipt$?: Observable<ReceiptDetailsDto>;
  public pagingParams: PagingParams = {
    PageNumber: 1,
    PageSize: 10 // Đặt kích thước trang mặc định
  };
  public totalCount: number = 0;
  public totalPages: number = 0;
  public errorMessage: string = '';
  private receipt = inject(ReceiptService)
  ngOnInit(): void {
    // Tải danh sách hóa đơn ngay khi component được khởi tạo
    this.loadUserReceipts();
  }

  loadUserReceipts(): void {
    this.errorMessage = ''; // Xóa lỗi cũ
    
    this.paginatedReceipts$ = this.receipt.getUserReceipts(this.pagingParams).pipe(
      tap(result => {
        // Lưu lại tổng số lượng để tính toán phân trang
        this.totalCount = result.TotalCount;
        this.totalPages = Math.ceil(this.totalCount / this.pagingParams.PageSize);
      }),
      catchError(err => {
        // Xử lý lỗi (ví dụ: 401 Unauthorized)
        console.error('Lỗi khi tải lịch sử hóa đơn:', err);
        this.errorMessage = 'Không thể tải lịch sử hóa đơn. Vui lòng thử lại sau.';
        return EMPTY; // Trả về Observable rỗng để không làm hỏng chuỗi
      })
    );
  }
  
  viewDetails(id: number): void {
    this.errorMessage = ''; // Xóa lỗi cũ
    
    this.selectedReceipt$ = this.receipt.getReceiptDetails(id).pipe(
      catchError(err => {
        // Xử lý lỗi (ví dụ: 404 Not Found hoặc không có quyền)
        console.error('Lỗi khi xem chi tiết hóa đơn:', err);
        this.errorMessage = 'Không tìm thấy hóa đơn hoặc bạn không có quyền xem.';
        return EMPTY;
      })
    );
  }

  closeDetails(): void {
    this.selectedReceipt$ = undefined; // Đặt observable về undefined
    this.errorMessage = ''; // Xóa lỗi (nếu có)
  }

  // === CÁC PHƯƠNG THỨC PHÂN TRANG ===

  /**
   * Chuyển đến trang trước đó.
   */
  prevPage(): void {
    if (this.pagingParams.PageNumber > 1) {
      this.pagingParams.PageNumber--;
      this.loadUserReceipts();
    }
  }

  /**
   * Chuyển đến trang kế tiếp.
   */
  nextPage(): void {
    if (this.pagingParams.PageNumber < this.totalPages) {
      this.pagingParams.PageNumber++;
      this.loadUserReceipts();
    }
  }

  /**
   * Chuyển đến một trang cụ thể.
   * (Hữu ích nếu bạn làm pagination có số trang)
   * @param pageNumber Số trang muốn đến.
   */
  goToPage(pageNumber: number): void {
    const totalPages = Math.ceil(this.totalCount / this.pagingParams.PageSize);
    if (pageNumber >= 1 && pageNumber <= totalPages && pageNumber !== this.pagingParams.PageNumber) {
      this.pagingParams.PageNumber = pageNumber;
      this.loadUserReceipts();
    }
  }
}
