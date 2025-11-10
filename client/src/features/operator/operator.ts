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

export interface PostWithSession extends Post {
  sessionId?: number | undefined; // ID phiên sạc hiện tại, nếu có
  startTime?: string;               // thời gian bắt đầu sạc
  plateInput?: string;              // input biển số cho walk-in
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

  chargingPost = signal<PostWithSession[]>([]);
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
              this.chargingPost.set(mappedPosts);
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
     const posts = [...this.chargingPost()];
     const index = posts.findIndex(p => p.code === session.chargingPostCode);

      if (index !== -1) {
        posts[index] = {
          ...posts[index],
          plateInput: session.vehiclePlate,
          status: 'charging',
          startTime: session.startTime
        };
        this.chargingPost.set(posts);
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
 const posts = [...this.chargingPost()];
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts[index] = {
        ...posts[index],
        sessionId: sessionId, // <-- Gán sessionId tại đây
      };
      this.chargingPost.set(posts);
    }

    // Lấy thông tin session từ backend (biển số, startTime)
    this.getSessionInfo(sessionId);
  });
    // Khi session disconnect
    // Khi session disconnect
this.presenceService.sessionDisconnected$.subscribe(({ postId }) => {
  const posts = [...this.chargingPost()];
  const index = posts.findIndex(p => p.id === postId);
  if (index !== -1) {
    posts[index] = {
      ...posts[index],
      status: 'available',
      sessionId: undefined,
      startTime: undefined
    };
    this.chargingPost.set(posts);
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

    this.operatorService.UpdatePlateForWalkIn(sessionId, slot.plateInput).subscribe({
      next: () => {
        this.toast.success(`Cập nhật biển số thành công: ${slot.plateInput}`);
        const posts = [...this.chargingPost()];
        const index = posts.findIndex(p => p.id === slot.id);
        if (index !== -1) {
          posts[index] = {
            ...posts[index],
            status: 'charging',
            startTime: new Date().toISOString(),
          };
          this.chargingPost.set(posts);
        }
      },
      error: err => {
        console.error('Lỗi khi cập nhật biển số:', err);
        this.toast.error(err.error?.detail || 'Cập nhật thất bại! Vui lòng thử lại.');
      }
    });
  }

  // =================== Thống kê ===================
  usedCount = computed(() => this.chargingPost().filter(p => p.status === 'charging').length);
  availableCount = computed(() => this.chargingPost().filter(p => p.status === 'available').length);

}