import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DriverService } from '../../core/service/driver-service';
import { CommonModule } from '@angular/common';
import { Vehicle } from "../../features/vehicle/vehicle";
import { GgMap } from "../../features/gg-map/gg-map";
import { PackagesService } from '../../core/service/packages-service';
import { MyPackage } from '../../_models/package';
import { ChargingSessionService } from '../../core/service/charging-service';
import { ChargingSessionHistory } from '../../_models/session';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Vehicle, GgMap],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  driverService = inject(DriverService);
  packageSvc = inject(PackagesService);
  driverPackage : MyPackage[] = []
  cdf = inject(ChangeDetectorRef);
  router = inject(Router);
  chargingService = inject(ChargingSessionService);

  fullChargeHistory: ChargingSessionHistory[] = []; 
  paginatedHistory: ChargingSessionHistory[] = [];
  isLoadingHistory = true;

  pageSize = 5; // Số item mỗi trang
  currentPage = signal(1); // Bắt đầu ở trang 1
  
  totalPages = computed(() => {
    return Math.ceil(this.fullChargeHistory.length / this.pageSize);
  });

  hasPreviousPage = computed(() => this.currentPage() > 1);
  hasNextPage = computed(() => this.currentPage() < this.totalPages());
  
  ngOnInit(): void {
    this.driverService.loadDriverProfile();
    this.loadDriverPackage();   
    this.loadChargeHistory(); 
  }

  loadChargeHistory() {
    this.isLoadingHistory = true;
    this.chargingService.getHistory().subscribe({
      next: (res) => {
        this.fullChargeHistory = res; 

        this.currentPage.set(1);
        this.updatePaginatedHistory(); 

        this.isLoadingHistory = false;
        this.cdf.detectChanges();
        console.log('Lịch sử sạc:', this.fullChargeHistory);
      },
      error: (err) => {
        console.error("Lỗi tải lịch sử sạc:", err);
        this.isLoadingHistory = false;
        this.cdf.detectChanges();
      }
    });
  }

  updatePaginatedHistory() {
    // Tính toán vị trí bắt đầu và kết thúc
    const startIndex = (this.currentPage() - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;

    this.paginatedHistory = this.fullChargeHistory.slice(startIndex, endIndex);
    
    this.cdf.detectChanges();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.updatePaginatedHistory();
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  loadDriverPackage(){
    this.packageSvc.getMyPackage().subscribe({
      next : (res) =>{
         this.driverPackage = res;
         console.log('Gói cước của tài xế:', this.driverPackage);
         this.cdf.detectChanges();
      },
      error :(err) =>{
        console.log("Lỗi Load Package",err);
      }
    })
  }

  cancelPackage(id: number) {
    Swal.fire({
      title: 'Xác nhận huỷ?',
      text: 'Bạn có chắc muốn huỷ gói này? Hành động không thể hoàn tác.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Huỷ gói',
      cancelButtonText: 'Đóng',
      confirmButtonColor: '#d33'
    }).then(result => {
      if (result.isConfirmed) {
        this.packageSvc.cancelPackage(id).subscribe({
          next: () => {
            Swal.fire('Thành công', 'Gói đã được huỷ.', 'success');
            this.driverPackage = this.driverPackage.filter(pkg => pkg.id !== id);
            this.cdf.detectChanges();
          },
          error: (err) => {
            console.error('Huỷ gói lỗi:', err);
            Swal.fire('Lỗi', 'Không thể huỷ gói.', 'error');
          }
        });
      }
    });
  }

  viewSessionDetail(id: number) {
    this.router.navigate(['/phien-sac', id]);
  }

  getRemainingDays(endDate: Date): number {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  
}

