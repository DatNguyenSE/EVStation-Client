import { Component, inject, OnDestroy, OnInit, signal, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StationService } from '../../core/service/station-service';
import { ChargingSessionService } from '../../core/service/charging-service';
import { ChargingHubService } from '../../core/service/charging-hub-service';
import { DtoStation, Post } from '../../_models/station';

import { of, Subscription, switchMap } from 'rxjs';
import { ToastService } from '../../core/service/toast-service';
import { ValidateScanResponse } from '../../_models/charging';
import { Vehicles } from '../../_models/vehicle';
import { DriverService } from '../../core/service/driver-service';

@Component({
  selector: 'app-charging-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './charging-dashboard.html',
  styleUrl: './charging-dashboard.css',
    changeDetection: ChangeDetectionStrategy.OnPush  // ✅ thêm dòng này
})
export class ChargingDashboard implements OnInit, OnDestroy {
  // === Inject services ===
  private chargingService = inject(ChargingSessionService);
  private hubService = inject(ChargingHubService);
  private driverService = inject(DriverService);
  private route = inject(ActivatedRoute);
  protected router = inject(Router);
  private stationService = inject(StationService);
  protected isStopping = false;
  protected isPaused = false;
  protected confirmed = signal(false);
  private toast = inject(ToastService);

  // === Trạng thái ===
  idPost!: string;
  postInfo!: Post;
  sessionId!: number;
  currentStation = signal<DtoStation | null>(null);
  errorMessage = signal<string | null>(null);
  private cdr = inject(ChangeDetectorRef);
  protected validateInfo!: ValidateScanResponse;
  protected vehicleInfo: Vehicles | undefined;
  // === Dữ liệu realtime ===
  chargedKwh = signal(0);
  totalPrice = signal(0);
  batteryPercent = signal(0);
  timeRemain = signal(0);

  // === Đăng ký lắng nghe realtime ===
  private realtimeSub?: Subscription;
  private stopSub?: Subscription;
  private fullSub?: Subscription;

  ngOnInit() {
    this.idPost = this.route.snapshot.paramMap.get('idPost')!;
    this.getPostInfo();
  }

  // --- Lấy thông tin trụ, trạm , reservationID, VehicleID---
  getPostInfo() {
    this.stationService.getPostById(this.idPost).subscribe({
      next: res => {
        this.postInfo = res;
        this.getStationInfo(this.postInfo.stationId);

        // Chỉ tiếp tục nếu trụ đang sẵn sàng
        if (this.postInfo.status === 'Available') {
          // Gọi validateScan → lấy reservation & vehicle → sau đó startSession
          this.getReservationAndVehicleInfo();
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
  // lấy thông tin reservationID + VehicleID
  getReservationAndVehicleInfo() {
    this.chargingService.validateScan(Number(this.idPost))
      .pipe(
        switchMap(res => {
          this.validateInfo = res;
          console.log('Reservation info:', res);

          // Nếu là walk-in thì bỏ qua bước lấy vehicle
          if (this.postInfo.isWalkIn) {
            return of(null); // trả về Observable rỗng để không bị lỗi switchMap
          } else {
            return this.driverService.GetVehicleById(res.vehicleId);
          }
        })
      )
      .subscribe({
        next: vehicle => {
          if (vehicle) {
            this.vehicleInfo = vehicle;
            console.log('Vehicle info:', vehicle);
          } else {
            console.log('Walk-in: không cần lấy thông tin xe.');
          }

          // Dữ liệu đã có đầy đủ -> bắt đầu session
          this.startSession();
        },
        error: err => {
          console.error('Lỗi khi lấy reservation/vehicle:', err);
          this.errorMessage.set('Không thể lấy thông tin đặt chỗ hoặc xe.');
        }
      });
  }



  // --- Bắt đầu phiên sạc ---

  startSession() {
    this.chargingService.startSession({
      postId: Number(this.idPost),
      vehicleId: this.vehicleInfo?.vehicleId,
      vehiclePlate: this.vehicleInfo?.plate,
      reservationId: this.validateInfo?.reservationId
    }).subscribe({
      next: session => {
        console.log(' Phiên sạc bắt đầu:', session);
        this.sessionId = session.id;
        this.cdr.detectChanges();
        //  Kết nối SignalR
        this.hubService.startConnection();
        setTimeout(() => this.hubService.joinSession(this.sessionId), 1000);

        //  Lắng nghe dữ liệu realtime (hoãn 1 tick để tránh NG0100)
        this.realtimeSub = this.hubService.chargingUpdate$
          .subscribe(data => {
            if (!data) return;

            //  Cập nhật signal — an toàn
            queueMicrotask(() => {
              this.batteryPercent.set(data.batteryPercentage ?? this.batteryPercent());
              this.chargedKwh.set(data.energyConsumed ?? this.chargedKwh());
              this.totalPrice.set(data.cost ?? this.totalPrice());
              this.timeRemain.set(data.timeRemain ?? this.timeRemain());
            });
          });

        //  Khi phiên bị dừng
        this.stopSub = this.hubService.sessionStopped$.subscribe(id => {
          console.warn(`Phiên sạc ${id} đã dừng.`);
        });

        //  Khi sạc đầy
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

// --- Dừng phiên sạc ---
  pressStopSession() {
  if (!this.sessionId || this.isStopping) return;

  const actionText = this.isPaused ? 'tiếp tục' : 'dừng';
  const confirmed = confirm(`Bạn có chắc muốn ${actionText} phiên sạc này không?`);
  if (!confirmed) return;

  this.isStopping = true;
  this.cdr.detectChanges();

  if (this.isPaused) {
    // Tiếp tục sạc
    this.startSession(); // Gọi lại hàm có sẵn của bạn
    this.isPaused = false;
    this.isStopping = false;
    this.confirmed.set(false);
    this.toast.success('Đã tiếp tục sạc');
    this.cdr.detectChanges();
  } else {
    this.chargingService.stopSession(this.sessionId).subscribe({
      next: () => {
        this.isPaused = true;
        this.isStopping = false;
        this.cdr.detectChanges();
        this.confirmed.set(true);
        console.log(this.sessionId + ' paused successfully');
        this.toast.success('Tạm dừng sạc thành công');
      },
      error: () => {
        this.isStopping = false;
        this.cdr.detectChanges();
        this.toast.error('Dừng sạc thất bại');
      }
    });
  }
}

  // --- Kết thúc phiên sạc ---
  pressEndSession() {
  if (!this.sessionId) return;

  const confirmed = confirm('Bạn có chắc hoàn tất phiên sạc này không?');
  if (!confirmed) return;

  this.chargingService.completeSession(this.sessionId).subscribe({
    next: () => {
      console.log(`${this.sessionId} EndSession successfully`);
      this.toast.success('Đã kết thúc phiên sạc thành công');
      this.toast.success('Hóa đơn đã được gửi đến email của bạn');
       setTimeout(() => {window.location.href = '/lichsugiaodich';}, 3000);
      
    },
    error: (err) => {
      console.error('End session failed', err);
      this.toast.error('Hoàn tất sạc thất bại');
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
