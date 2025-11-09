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
import { PaginationMeta } from '../../core/service/transaction-service';

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

  pagination = signal<PaginationMeta>({ currentPage: 1, pageSize: 5, totalPages: 1, totalCount: 0 });
  paginatedHistory: ChargingSessionHistory[] = [];
  isLoadingHistory = true;

  get totalPages() { return this.pagination().totalPages; }
  get currentPage() { return this.pagination().currentPage; }
  get hasPreviousPage() { return this.currentPage > 1; }
  get hasNextPage() { return this.currentPage < this.totalPages; }
  
  ngOnInit(): void {
    this.driverService.loadDriverProfile();
    this.loadDriverPackage();   
    this.loadChargeHistory(1); 
  }

  loadChargeHistory(page: number) {
    this.isLoadingHistory = true;
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

