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
import { PresenceService } from '../../core/service/presence-service';
import { ReservationService } from '../../core/service/reservation-service';
import { HubConnectionState } from '@microsoft/signalr';

@Component({
  selector: 'app-charging-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './charging-dashboard.html',
  styleUrl: './charging-dashboard.css',
    changeDetection: ChangeDetectionStrategy.OnPush  //  thêm dòng này xóa lỗi Change Detection
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

  // protected confirmed = signal(false);
  protected isCompleted = signal(false);

  private toast = inject(ToastService);
  private presenceService = inject(PresenceService);

  // === Trạng thái ===
  idPost!: string;
  postInfo = signal<Post | null>(null);
  sessionId!: number;
  currentStation = signal<DtoStation | null>(null);
  errorMessage = signal<string | null>(null);
  // private cdr = inject(ChangeDetectorRef);
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
  private insufficientFundsSub?: Subscription;
  private countdownInterval?: any;

  // Bắt đầu đếm ngược
  private startCountdown() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    this.countdownInterval = setInterval(() => {
      const current = this.timeRemain();
      if (current > 0) {
        this.timeRemain.set(current - 1);
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  ngOnInit() {
    this.idPost = this.route.snapshot.paramMap.get('idPost')!;
    // ✨ KIỂM TRA RECONNECT TRƯỚC
    const savedSessionId = this.checkForExistingSession();
    
    if (savedSessionId) {
      console.log('🔄 Phát hiện session cũ, đang reconnect...');
      this.reconnectToSession(savedSessionId);
    } else {
      console.log('🆕 Bắt đầu session mới...');
      this.presenceService.createHubConnection();
      this.getPostInfo();
    }
  }

  // ✨ HÀM MỚI: Kiểm tra localStorage
  private checkForExistingSession(): number | null {
    try {
      const savedData = localStorage.getItem(`charging_session_${this.idPost}`);
      if (!savedData) return null;
      
      const data = JSON.parse(savedData);
      const savedTime = new Date(data.timestamp);
      const now = new Date();
      
      // Chỉ cho phép reconnect trong vòng 24h
      const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
      if (hoursDiff > 24) {
        localStorage.removeItem(`charging_session_${this.idPost}`);
        return null;
      }
      
      return data.sessionId;
    } catch (error) {
      console.error('Lỗi khi đọc localStorage:', error);
      return null;
    }
  }

  // ✨ HÀM MỚI: Reconnect session
  private reconnectToSession(sessionId: number) {
    this.chargingService.reconnectSession(sessionId).subscribe({
      next: (response) => {
        console.log('✅ Reconnect thành công:', response);
        
        // Khôi phục state
        this.sessionId = response.sessionId;
        this.postInfo.set({
          id: response.postInfo.id,
          code: response.postInfo.code, // Thêm code nếu có
          type: response.postInfo.type,
          powerKW: response.postInfo.powerKW,
          connectorType: response.postInfo.connectorType,
          status: response.postInfo.status,
          stationId: response.stationId,
          isWalkIn: false // BE không trả về, tạm set false
        } as Post);
        
        this.currentStation.set({
          id: response.stationId,
          name: response.stationName,
          address: response.stationAddress,
          status: 'Active' // BE không trả về, tạm set Active
        } as DtoStation);
        
        if (response.vehicleInfo) {
          this.vehicleInfo = {
            vehicleId: 0, // BE không trả về vehicleId, có thể thêm sau
            plate: response.vehicleInfo.plate,
            model: response.vehicleInfo.model,
            batteryCapacityKWh: response.vehicleInfo.batteryCapacityKWh,
            type: '', // BE không trả về
            maxChargingPowerKW: 0, // BE không trả về
            connectorType: '', // BE không trả về
            registrationStatus: '' // BE không trả về
          } as Vehicles; // Cast để bypass TypeScript
        }
        
        // Khôi phục state realtime
        this.batteryPercent.set(response.currentState.batteryPercent);
        this.chargedKwh.set(response.currentState.chargedKwh);
        this.totalPrice.set(response.currentState.totalPrice);
        
        // Reconnect SignalR
        this.presenceService.createHubConnection();
        this.hubService.startConnection();
        setTimeout(() => this.hubService.joinSession(this.sessionId), 1000);
        
        // Đăng ký lắng nghe realtime updates
        this.subscribeToRealtimeUpdates();
        
        this.toast.success('Đã khôi phục phiên sạc');
      },
      error: (err) => {
        console.error('❌ Reconnect thất bại:', err);
        localStorage.removeItem(`charging_session_${this.idPost}`);
        this.toast.error('Không thể khôi phục phiên sạc. Vui lòng bắt đầu mới.');
        this.errorMessage.set('Phiên sạc đã kết thúc hoặc không tồn tại.');
      }
    });
  }

  // ✨ REFACTOR: Tách logic subscribe ra hàm riêng
  private subscribeToRealtimeUpdates() {
    this.realtimeSub = this.hubService.chargingUpdate$.subscribe(data => {
      if (!data) return;
      queueMicrotask(() => {
        this.batteryPercent.set(data.batteryPercentage ?? this.batteryPercent());
        this.chargedKwh.set(data.energyConsumed ?? this.chargedKwh());
        this.totalPrice.set(data.cost ?? this.totalPrice());
        this.timeRemain.set(data.timeRemainTotalSeconds ?? this.timeRemain());
        this.startCountdown();
      });
    });

    this.stopSub = this.hubService.sessionStopped$.subscribe(id => {
      console.warn(`Phiên sạc ${id} đã dừng.`);
    });

    this.fullSub = this.hubService.sessionCompleted$.subscribe(id => {
      console.log(`Phiên sạc ${id} đã đầy pin.`);
      if (id === this.sessionId) {
      this.isCompleted.set(true);
      this.isPaused = true; // Cập nhật UI về trạng thái "đã dừng"
      this.toast.success('Pin đã đầy! Bạn có thể hoàn tất phiên sạc.');
    }
    });

    this.insufficientFundsSub = this.hubService.insufficientFunds$.subscribe(data => {
      if (data.sessionId === this.sessionId) {
        console.error('LỖI: Hết tiền, dừng sạc!');

        // 1. Cập nhật trạng thái UI
        // Dùng lại logic của "Pin đầy" để khóa nút "Tiếp tục" và mở nút "Hoàn tất"
        this.isPaused = true; 
        this.isCompleted.set(true);

        // 2. Dừng đếm ngược
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.timeRemain.set(0);

        // 3. Thông báo khẩn cấp cho người dùng
        this.toast.error('Sạc đã dừng do không đủ tiền trong ví!'); 
        
        // Bạn cũng có thể set errorMessage để hiển thị một box đỏ lớn (tùy chọn)
        // this.errorMessage.set('Phiên sạc đã bị dừng do không đủ tiền.');
      }
    });
  }

  // --- Lấy thông tin trụ, trạm , reservationID, VehicleID---
  getPostInfo() {
    this.stationService.getPostById(this.idPost).subscribe({
      next: res => {
        this.postInfo.set(res);
        this.getStationInfo(res.stationId);

        // Chỉ tiếp tục nếu trụ đang sẵn sàng
        if (this.postInfo()?.status === 'Available') {
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
          if (this.postInfo()?.isWalkIn) {
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

  // Format giây → hh:mm:ss
  protected formatTimeRemain(): string {
    const totalSeconds = this.timeRemain();
    if (totalSeconds <= 0) return '00:00';

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // < 1 phút → chỉ hiện giây
    if (hours === 0 && minutes === 0) {
      return `${seconds} giây`;
    }

    // < 1 giờ → mm:ss
    if (hours === 0) {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // >= 1 giờ → hh:mm:ss
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
        // ====kết nối SignalR-ConnectCharging


         this.presenceService.sendConnectCharging(this.idPost);
      
        this.sessionId = session.id;
        this.saveSessionToLocalStorage(session.id);

        const currentPost = this.postInfo(); // Lấy thông tin trụ hiện tại
        if (currentPost) {
          this.postInfo.set({
            ...currentPost, // Giữ tất cả thông tin cũ (id, type, powerKW...)
            status: 'Occupied' // Chỉ ghi đè trạng thái
          });
        } else {
          // Phòng hờ nếu currentPost là null, thì mới gọi lại API
          this.stationService.getPostById(this.idPost).subscribe({
            next: updatedPost => this.postInfo.set(updatedPost)
          });
        }

        // ====kết nối SignalR-ChargingHub
        this.hubService.startConnection();
        setTimeout(() => this.hubService.joinSession(this.sessionId), 1000);

        // Subscribe to updates
        this.subscribeToRealtimeUpdates();
      },
      error: err => {
        console.error('Start session failed:', err);
        this.errorMessage.set('Không thể bắt đầu phiên sạc.');
      }
    });
  }

  // ✨ HÀM MỚI: Lưu session vào localStorage
  private saveSessionToLocalStorage(sessionId: number) {
    try {
      const data = {
        sessionId: sessionId,
        postId: this.idPost,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`charging_session_${this.idPost}`, JSON.stringify(data));
      console.log('💾 Đã lưu sessionId vào localStorage');
    } catch (error) {
      console.error('Lỗi khi lưu localStorage:', error);
    }
  }

// --- Dừng phiên sạc ---
  async pressStopSession() {
  if (!this.sessionId || this.isStopping) return;

  const actionText = this.isPaused ? 'tiếp tục' : 'dừng';
  const confirmed = confirm(`Bạn có chắc muốn ${actionText} phiên sạc này không?`);
  if (!confirmed) return;

  this.isStopping = true;

  if (this.isPaused) {
    // Tiếp tục sạc
    await this.presenceService.sendConnectCharging(this.idPost);
    this.startSession(); // Gọi lại hàm có sẵn của bạn
    this.isPaused = false;
    this.isStopping = false;
    // this.confirmed.set(false);
    this.toast.success('Đã tiếp tục sạc');
  } else {
    this.chargingService.stopSession(this.sessionId).subscribe({
      next: async () => {
        await this.presenceService.sendDisconnectCharging(this.idPost);
        this.isPaused = true;
        this.isStopping = false;
        // this.confirmed.set(true);
        console.log(this.sessionId + ' paused successfully');
        this.toast.success('Tạm dừng sạc thành công');
        

      },
      error: () => {
        this.isStopping = false;
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
    next: async () => {
      await this.presenceService.sendDisconnectCharging(this.idPost);
      this.presenceService.stopHubConnection(); // Dừng kết nối SignalR-ConnectCharging

      // 🗑️ XÓA LOCALSTORAGE
      localStorage.removeItem(`charging_session_${this.idPost}`);

      console.log(`${this.sessionId} EndSession successfully`);
      this.toast.success('Đã kết thúc phiên sạc thành công');
      // this.toast.success('Hóa đơn đã được gửi đến email của bạn');
      setTimeout(() => {window.location.href = '/lichsugiaodich';}, 3000);
      
    },
    error: (err) => {
      console.error('End session failed', err);
      this.toast.error('Hoàn tất sạc thất bại');
    }
  });
}


  ngOnDestroy() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.sessionId) this.hubService.leaveSession(this.sessionId);
    this.realtimeSub?.unsubscribe();
    this.stopSub?.unsubscribe();
    this.fullSub?.unsubscribe();
    this.insufficientFundsSub?.unsubscribe();
    this.hubService.stopConnection();
    this.presenceService.stopHubConnection();
  }
}
