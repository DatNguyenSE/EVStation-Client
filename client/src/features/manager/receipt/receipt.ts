import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ReceiptService } from '../../../core/service/receipt-service';
import { ManagerService } from '../../../core/service/manager-service';
import { AccountService } from '../../../core/service/account-service';
import { ReceiptFilterParams, ReceiptSummaryDto } from '../../../_models/receipt';
import { clearHttpCache } from '../../../core/interceptors/loading-interceptor';

@Component({
  selector: 'app-receipt',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './receipt.html',
  styleUrl: './receipt.css',  
})
export class ReceiptManager implements OnInit{
  private receiptService = inject(ReceiptService);
  private managerService = inject(ManagerService);
  private accountService = inject(AccountService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  receipts: ReceiptSummaryDto[] = [];
  
  // Thông tin trạm của Manager (để hiển thị lên giao diện)
  assignedStationName: string = '';
  assignedStationId: number | undefined;

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  isLoading = false;

  // Filter: Không cần field stationId vì nó sẽ được set cứng
  filter: ReceiptFilterParams = {
    stationId: undefined, 
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    appUserName: undefined,
  };

  ngOnInit() {
    this.initializeManagerData();
  }

  initializeManagerData() {
    this.isLoading = true;
    // 1. Lấy thông tin User hiện tại (Giả sử AccountService có hàm này)
    const currentUser = this.accountService.currentAccount(); 
    
    if (!currentUser || !currentUser.id) {
      console.error('Không tìm thấy thông tin Manager đăng nhập');
      this.isLoading = false;
      return;
    }

    // 2. Gọi API lấy phân công để biết Manager quản lý trạm nào
    this.managerService.getAssignment(currentUser.id).subscribe({
      next: (res) => {
        if (res && res.station) {
          this.assignedStationId = res.station.id;
          this.assignedStationName = res.station.name || 'Trạm không tên';
          
          // 3. SET CỨNG stationId vào filter
          this.filter.stationId = this.assignedStationId;

          // 4. Load biên lai sau khi đã có stationId
          this.loadReceipts(); 
        } else {
          console.warn('Manager này chưa được phân công trạm nào');
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Lỗi lấy thông tin phân công:', err);
        this.isLoading = false;
      }
    });
  }

  loadReceipts(page = 1) {
    if (!this.assignedStationId) return; // Chặn nếu chưa có trạm

    this.isLoading = true;
    
    // Đảm bảo luôn filter theo trạm của manager
    this.filter.stationId = this.assignedStationId; 

    this.receiptService.getAdminReceipts(page, this.pageSize, this.filter).subscribe({
      next: (res) => {
        this.receipts = res.items;
        this.currentPage = res.pageNumber;
        this.totalPages = res.pageCount;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  applyFilter() {
    clearHttpCache();
    this.loadReceipts(1);
  }

  resetFilter() {
    this.filter = {
      stationId: this.assignedStationId, // Quan trọng: Reset nhưng vẫn giữ stationId
      status: undefined,
      startDate: undefined,
      endDate: undefined,
      appUserName: undefined,
    };
    clearHttpCache();
    this.loadReceipts(1);
  }

  prevPage() {
    if (this.currentPage > 1) this.loadReceipts(this.currentPage - 1);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.loadReceipts(this.currentPage + 1);
  }

  viewDetail(id: number) {
    // Chuyển hướng đến route chi tiết của Manager
    this.router.navigate(['/quan-ly-tram/bien-lai', id]);
  }
}
