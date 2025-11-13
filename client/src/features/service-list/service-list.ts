import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { GgMap } from "../gg-map/gg-map";
import { RegisterVehicle } from "../register-vehicle/register-vehicle";
import { Packages } from "../packages/packages";
import { QrCodeComponent } from "../qr-code/qr-code";
import { ChargingSessionService } from '../../core/service/charging-service';
import { Router } from '@angular/router';
import { PaginationMeta } from '../../core/service/transaction-service';
import { ChargingSessionHistory } from '../../_models/session';

@Component({
  selector: 'app-service-list',
  standalone:true,
  imports: [CommonModule, GgMap, RegisterVehicle, Packages, QrCodeComponent],
  templateUrl: './service-list.html',
  styleUrl: './service-list.css'
})
export class ServiceList {
  activeTab: string = '';
  selectedPackage: any;

  // 1. Inject các service cần thiết
  private chargingService = inject(ChargingSessionService);
  private cdf = inject(ChangeDetectorRef);
  private router = inject(Router);

  // 2. State cho lịch sử sạc và phân trang
  // Yêu cầu của bạn là pageSize = 10
  pagination = signal<PaginationMeta>({ currentPage: 1, pageSize: 10, totalPages: 1, totalCount: 0 });
  paginatedHistory: ChargingSessionHistory[] = [];
  isLoadingHistory = true;

  // 3. Getters cho phân trang
  get totalPages() { return this.pagination().totalPages; }
  get currentPage() { return this.pagination().currentPage; }
  get hasPreviousPage() { return this.currentPage > 1; }
  get hasNextPage() { return this.currentPage < this.totalPages; }
  
  // 4. Tải dữ liệu khi component khởi tạo
  ngOnInit(): void {
    // Tải lịch sử sạc ngay khi component được tạo
    this.loadChargeHistory(1); 
  }

  // 5. Các hàm xử lý
  loadChargeHistory(page: number) {
    this.isLoadingHistory = true;
    // Dùng pageSize từ signal (đã set là 10)
    this.chargingService.getHistory(page, this.pagination().pageSize).subscribe({
      next: (res) => {
        this.paginatedHistory = res.sessions;
        this.pagination.set(res.pagination);
        this.isLoadingHistory = false;
        this.cdf.detectChanges();
      },
      error: (err) => {
        console.error("Lỗi tải lịch sử sạc:", err);
        this.isLoadingHistory = false;
        this.cdf.detectChanges();
      }
    });
  }

  nextPage() {
    if (this.hasNextPage) this.loadChargeHistory(this.currentPage + 1);
  }

  prevPage() {
    if (this.hasPreviousPage) this.loadChargeHistory(this.currentPage - 1);
  }

  // Thêm hàm này để click vào xem chi tiết
  viewSessionDetail(id: number) {
    this.router.navigate(['/phien-sac', id]);
  }
}
