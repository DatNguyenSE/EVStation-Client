import { Component, inject, OnDestroy, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StationService } from '../../core/service/station-service';
import { ChargingSessionService } from '../../core/service/charging-service';
import { ChargingHubService } from '../../core/service/charging-hub-service';
import { DtoStation, Post } from '../../_models/station';

import { Subscription } from 'rxjs';
import { ToastService } from '../../core/service/toast-service';

@Component({
  selector: 'app-charging-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './charging-dashboard.html',
  styleUrl: './charging-dashboard.css'
})
export class ChargingDashboard implements OnInit, OnDestroy {
  // === Inject services ===
  private chargingService = inject(ChargingSessionService);
  private hubService = inject(ChargingHubService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private stationService = inject(StationService);
  protected isStopping = false;
  private toast = inject(ToastService);
  
  // === Trạng thái ===
  idPost!: string;
  postInfo!: Post;
  sessionId!: number;
  currentStation = signal<DtoStation | null>(null);
  errorMessage = signal<string | null>(null);
  private cdr = inject(ChangeDetectorRef);

  // === Dữ liệu realtime ===
  chargedKwh = 0;
  totalPrice = 0;
  batteryPercent = 0;
  timeRemain = 0;

  // === Đăng ký lắng nghe realtime ===
  private realtimeSub?: Subscription;
  private stopSub?: Subscription;
  private fullSub?: Subscription;

  ngOnInit() {
    this.idPost = this.route.snapshot.paramMap.get('idPost')!;
    this.getPostInfo();
  }

  // --- Lấy thông tin trụ, trạm ---
  getPostInfo() {
    this.stationService.getPostById(this.idPost).subscribe({
      next: res => {
        this.postInfo = res;
        this.getStationInfo(this.postInfo.stationId);

        if (this.postInfo.status === 'Available') {
          this.startSession();
        } else {
          this.errorMessage.set('Trụ đang bận hoặc không sẵn sàng.');
        }
      },
      error: err => {
        console.error('Lỗi lấy thông tin trụ:', err);
        this.errorMessage.set('Không thể tải thông tin trụ sạc.');
      }
    });
  }

  // thông tin trạm 
  getStationInfo(idStation: number) {
    this.stationService.getStationByid(idStation).subscribe({
      next: res => this.currentStation.set(res),
      error: err => console.error('Lỗi khi lấy thông tin trạm:', err)
    });
  }

  // --- Bắt đầu phiên sạc ---
  //code cứng
  startSession() {
    this.chargingService.startSession({
      postId: Number(this.idPost),
      vehicleId: 1,
      vehiclePlate: '68C1-10368',
      reservationId: 1
    }).subscribe({
      next: session => {
        console.log(' Phiên sạc bắt đầu:', session);
        this.sessionId = session.id;

        //  Kết nối SignalR
        this.hubService.startConnection();
        setTimeout(() => this.hubService.joinSession(this.sessionId), 1000);

        // Lắng nghe realtime từ Hub
        this.realtimeSub = this.hubService.chargingUpdate$.subscribe(data => {
          if (!data) return;
          console.log(' Dữ liệu realtime:', data);

          // Đồng bộ với key từ backend
          this.batteryPercent = data.batteryPercentage ?? this.batteryPercent;
          this.chargedKwh = data.energyConsumed ?? this.chargedKwh;
          this.totalPrice = data.cost ?? this.totalPrice;
          this.timeRemain = data.timeRemain ?? this.timeRemain;

          this.cdr.detectChanges();
        });
        // Khi phiên bị dừng
        this.stopSub = this.hubService.sessionStopped$.subscribe(id => {
          console.warn(`Phiên sạc ${id} đã dừng.`);
        });

        // Khi sạc đầy
        this.fullSub = this.hubService.sessionCompleted$.subscribe(id => {
          console.log(`Phiên sạc ${id} đã đầy pin.`);
        });
      },
      error: err => {
        console.error('Start session failed:', err);
        this.errorMessage.set('Không thể bắt đầu phiên sạc.');
      }
    });
  }


  pressEndSession() {
    if (!this.sessionId) return;

    const confirmed = confirm('Bạn có chắc muốn dừng phiên sạc này không?');
    if (!confirmed) return;

    this.isStopping = true;
    this.cdr.detectChanges();

    this.chargingService.stopSession(this.sessionId).subscribe({
      next: () => {
        this.isStopping = false;
        this.cdr.detectChanges();
        this.toast.success('Đã dừng sạc thành công ');
      },
      error: () => {
        this.isStopping = false;
        this.cdr.detectChanges();
        this.toast.error('Dừng sạc thất bại');
      }
    });
  }

  ngOnDestroy() {
    if (this.sessionId) this.hubService.leaveSession(this.sessionId);
    this.realtimeSub?.unsubscribe();
    this.stopSub?.unsubscribe();
    this.fullSub?.unsubscribe();
  }
}
