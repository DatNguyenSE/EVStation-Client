import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PresenceService } from '../../core/service/presence-service';
import { OperatorService } from '../../core/service/operator-service';
import { AccountService } from '../../core/service/account-service';
import { DtoStation, Post } from '../../_models/station';
import { StationService } from '../../core/service/station-service';
import { Account } from '../../_models/user';
import { ToastService } from '../../core/service/toast-service';
import { Vehicles } from '../../_models/vehicle';

export interface PostWithSession extends Post {
  sessionId?: number | undefined;
  startTime?: string;
  plateInput?: string;  // Input từ form
  vehiclePlate?: string; 
  vehicle?: any;
}

@Component({
  selector: 'app-operator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operator.html',
  styleUrl: './operator.css'
})
export class Operator implements OnInit {

  private presenceService = inject(PresenceService);
  protected operatorService = inject(OperatorService);
  private accountService = inject(AccountService);
  protected stationService = inject(StationService);
  private toast = inject(ToastService);

  chargingPostSession = signal<PostWithSession[]>([]);
  StaffInfo = signal<Account | undefined>(undefined);
  StationInfo = signal<DtoStation | undefined>(undefined);

  ngOnInit() {
    this.getAssignments();
    this.subscribeToRealtime();
  }

  // =================== Lấy dữ liệu từ server ===================
  getAssignments() {
    const staffId = this.accountService.currentAccount()?.id || '';
    this.operatorService.getAssignment(staffId).subscribe({
      next: res => {
        this.StationInfo.set(res.station);
        this.StaffInfo.set(res.staff);

        const stationId = res.station.id;
        if (stationId) {
          this.stationService.getStationByid(stationId).subscribe({
            next: stationRes => {
              // Map post để thêm sessionId, startTime, plateInput
              const mappedPosts: PostWithSession[] = stationRes.chargingPosts.map(post => ({
                ...post,
                sessionId: undefined,
                startTime: post.status === 'charging' ? new Date().toISOString() : undefined,
                plateInput: ''
              }));
              this.chargingPostSession.set(mappedPosts);
            },
            error: err => console.error('Lỗi khi lấy trụ sạc:', err)
          });
        }
      },
      error: err => console.error('Lỗi khi phân công nhân viên', err)
    });
  }

  getSessionInfo(sessionId: number) {
    this.operatorService.getSessionDetail(sessionId).subscribe({
      next: (session) => {
        const posts = [...this.chargingPostSession()];
        const index = posts.findIndex(p => p.code === session.chargingPostCode);

        if (index !== -1) {
          posts[index] = {
            ...posts[index],
            plateInput: session.vehiclePlate,
            status: 'charging',
            startTime: session.startTime
          };
          this.chargingPostSession.set(posts);
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy thông tin session:', err);
      }
    });
  }

  // =================== Realtime SignalR ===================
  private subscribeToRealtime() {
    // Khi session connect
    this.presenceService.sessionConnected$.subscribe(({ postId, sessionId }) => {
      const posts = [...this.chargingPostSession()];
      const index = posts.findIndex(p => p.id === postId);
      if (index !== -1) {
        posts[index] = {
          ...posts[index],
          sessionId: sessionId, // <-- Gán sessionId tại đây
        };
        this.chargingPostSession.set(posts);
      }

      // Lấy thông tin session từ backend (biển số, startTime)
      this.getSessionInfo(sessionId);
    });
    // Khi session disconnect
    // Khi session disconnect
    this.presenceService.sessionDisconnected$.subscribe(({ postId }) => {
      const posts = [...this.chargingPostSession()];
      const index = posts.findIndex(p => p.id === postId);
      if (index !== -1) {
        posts[index] = {
          ...posts[index],
          status: 'available',
          sessionId: undefined,
          startTime: undefined
        };
        this.chargingPostSession.set(posts);
      }
    });

  }

  // =================== Cập nhật biển số cho walk-in ===================
  updatePlateForWalkIn(slot: PostWithSession) {
  if (!slot.isWalkIn) {
    this.toast.error('Chỉ dành cho vãng lai!');
    return;
  }

  if (!slot.plateInput || slot.plateInput.trim() === '') {
    this.toast.error('Vui lòng nhập biển số!');
    return;
  }

  const sessionId = slot.sessionId;
  if (!sessionId) {
    this.toast.error('Không tìm thấy sessionId cho trụ này!');
    return;
  }

  
  const payload = { plate: slot.plateInput };
  
  console.log('🔍 Request payload:', payload);
  console.log('🔍 SessionId:', sessionId);
  
  
  // ✅ Gọi với tên parameter mới (nếu đổi)
  this.operatorService.UpdatePlateForWalkIn(sessionId, slot.plateInput).subscribe({
    next: (response) => {
      console.log(' Cập nhật biển số thành công:', response);
      console.log(' Vehicle info:', response.vehicle);
      console.log(' Vehicle plate:', response.vehiclePlate);

      this.toast.success(`Cập nhật biển số thành công: ${slot.plateInput}`);

      const posts = [...this.chargingPostSession()];
      const index = posts.findIndex(p => p.id === slot.id);

      if (index !== -1) {
        posts[index] = {
          ...posts[index],
          status: response.status?.toLowerCase() || 'charging',
          startTime: response.startTime || new Date().toISOString(),
          vehiclePlate: response.vehiclePlate || slot.plateInput,
          vehicle: response.vehicle || null,
          sessionId: response.id || sessionId
        };
        this.chargingPostSession.set(posts);
        
        console.log(' Trụ sau cập nhật:', posts[index]);
      }
    },

    error: err => {
      console.error(' Lỗi khi cập nhật biển số:', err);
      this.toast.error(err.error?.detail || 'Cập nhật thất bại! Vui lòng thử lại.');
    }
  });
}
  // =================== Thống kê ===================
  usedCount = computed(() => this.chargingPostSession().filter(p => p.status === 'charging').length);
  availableCount = computed(() => this.chargingPostSession().filter(p => p.status === 'available').length);

}