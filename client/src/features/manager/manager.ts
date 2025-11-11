import { Component, computed, inject, signal } from '@angular/core';
import { AccountService } from '../../core/service/account-service';
import { ManagerService } from '../../core/service/manager-service';
import { DtoStation, Post } from '../../_models/station';
import { Account } from '../../_models/user';
import { PostWithSession } from '../operator/operator';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StationService } from '../../core/service/station-service';
import { Revenues } from '../../_models/revenue';

@Component({
  selector: 'app-manager',
  imports: [CommonModule,FormsModule],
  templateUrl: './manager.html',
  styleUrl: './manager.css',
})
export class Manager {
  private accountService = inject(AccountService);
  private managerService = inject(ManagerService);
  private stationService = inject(StationService)

   StaffInfo = signal<Account | undefined>(undefined);
  StationInfo = signal<DtoStation | undefined>(undefined);
  revenues = signal<Revenues[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  // chargingPostSession = signal<PostWithSession[]>([]);
  chargingPost = signal<Post[]>([]);

  totalPosts = signal(0);
  availablePosts = signal(0);
  occupiedPosts = signal(0);
  maintenancePosts = signal(0);
  offlinePosts = signal(0);
  totalRevenue = signal(0);
   startDate = '';
  endDate = '';

  ngOnInit() {
    const today = new Date();

    // Lấy ngày đầu và cuối tháng
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Format yyyy/MM/dd
    const pad = (n: number) => n.toString().padStart(2, '0');
    this.startDate = `${firstDay.getFullYear()}/${pad(firstDay.getMonth() + 1)}/${pad(firstDay.getDate())}`;
    this.endDate = `${lastDay.getFullYear()}/${pad(lastDay.getMonth() + 1)}/${pad(lastDay.getDate())}`;
    this.getAssignments();
  }
  reloadData() {
    const station = this.StationInfo();
    if (station) {
    this.isLoading.set(true);
    this.getStationById(station.id);
    this.loadRevenue(station.id);
    } else {
    this.getAssignments();
  }
}

  getAssignments() {
    const staff = this.accountService.currentAccount();
    if (!staff) {
      this.error.set('Không tìm thấy thông tin nhân viên đang đăng nhập');
      this.isLoading.set(false);
      return;
    }

    const staffId = staff.id;
    this.managerService.getAssignment(staffId).subscribe({
      next: (res) => {
        this.StationInfo.set(res.station);
        this.StaffInfo.set(res.staff);
        this.getStationById(res.station.id);
        this.loadRevenue(res.station.id);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Không thể tải dữ liệu: ' + err.message);
        this.isLoading.set(false);
      }
    });
  }

   getStationById(stationId: number) {
    this.stationService.getStationByid(stationId).subscribe({
      next: (station) => {
        this.StationInfo.set(station);
        const posts = station.chargingPosts || [];
        this.chargingPost.set(posts);

        // ✅ Tính toán số liệu
        this.totalPosts.set(posts.length);
        this.availablePosts.set(posts.filter(p => p.status === 'Available').length);
        this.occupiedPosts.set(posts.filter(p => p.status === 'Occupied').length);
        this.maintenancePosts.set(posts.filter(p => p.status === 'Maintenance').length);
        this.offlinePosts.set(posts.filter(p => p.status === 'Offline').length);

        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Không thể tải dữ liệu trạm: ' + err.message);
        this.isLoading.set(false);
      },
    });
  }

  loadRevenue(stationId: number) {
    this.managerService.loadRevenuebystaion(this.startDate, this.endDate, 'Month', stationId).subscribe({
      next: (data) => {
        this.revenues.set(data);
        this.totalRevenue.set(data.reduce((sum, item) => sum + item.totalRevenue, 0)); // tính tổng tiền
      },
      error: (err) => {
        this.error.set('Không thể tải doanh thu: ' + err.message);
      },
    });
  }





}
