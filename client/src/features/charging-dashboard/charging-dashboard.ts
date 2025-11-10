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
  private cdr = inject(ChangeDetectorRef);

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

  // Dữ liệu phí phạt
  idleFee = signal(0);
  overstayFee = signal(0);
  graceTimeRemain = signal(0);

  // === Đăng ký lắng nghe realtime ===
  private realtimeSub?: Subscription;
  private stopSub?: Subscription;
  private fullSub?: Subscription;
  private insufficientFundsSub?: Subscription;
  private idleFeeSub?: Subscription;
  private countdownInterval?: any;
  private graceCountdownInterval?: any;

  // Bắt đầu đếm ngược
  private startCountdown() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);

    if (this.isPaused) return;

    this.countdownInterval = setInterval(() => {
      const current = this.timeRemain();
      if (current > 0) {
        this.timeRemain.set(current - 1);
      } else {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  private startGraceCountdown(initialSeconds?: number) {
    if (this.graceCountdownInterval) clearInterval(this.graceCountdownInterval);

    // Đặt thời gian ân hạn = 3 phút (180 giây)
    const totalSeconds = initialSeconds ?? 3 * 60;
    this.graceTimeRemain.set(totalSeconds);

    this.graceCountdownInterval = setInterval(() => {
      const current = this.graceTimeRemain();
      if (current > 0) {
        this.graceTimeRemain.set(current - 1);
      } else {
        clearInterval(this.graceCountdownInterval);
        console.log('Hết thời gian ân hạn, bắt đầu tính phí phạt!');
      }
    }, 1000);
  }

  private stopGraceCountdown() {
    if (this.graceCountdownInterval) {
      clearInterval(this.graceCountdownInterval);
      this.graceTimeRemain.set(0);
    }
  }

  ngOnInit() {
    this.idPost = this.route.snapshot.paramMap.get('idPost')!;
    // KIỂM TRA RECONNECT TRƯỚC
    const savedSessionId = this.checkForExistingSession();
    
    if (savedSessionId) {
      console.log(' Phát hiện session cũ, đang reconnect...');
      this.reconnectToSession(savedSessionId);
    } else {
      console.log(' Bắt đầu session mới...');
      this.presenceService.createHubConnection();
      this.getPostInfo();
    }
  }

  // Kiểm tra localStorage
  private checkForExistingSession(): number | null {
    try {
      const savedData = localStorage.getItem(`charging_post_${this.idPost}`);
      if (!savedData) return null;
      
      const data = JSON.parse(savedData);
      const savedTime = new Date(data.timestamp);
      const now = new Date();
      
      // Chỉ cho phép reconnect trong vòng nửa h
      const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
      if (hoursDiff > 0.5) {
        localStorage.removeItem(`charging_post_${this.idPost}`);
        return null;
      }
      
      return data.sessionId;
    } catch (error) {
      console.error('Lỗi khi đọc localStorage:', error);
      return null;
    }
  }

  // Reconnect session
  private reconnectToSession(sessionId: number) {
    this.chargingService.reconnectSession(sessionId).subscribe({
      next: (response) => {
        console.log(' Reconnect thành công:', response);
        
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
          vehicleId: response.vehicleInfo.vehicleId || response.vehicle?.id || 0,
          //  ƯU TIÊN vehiclePlate từ session, không phải vehicle.plate
          plate: response.vehiclePlate || response.vehicleInfo.plate || '',
          model: response.vehicleInfo.model || response.vehicle?.model || '',
          batteryCapacityKWh: response.vehicleInfo.batteryCapacityKWh || response.vehicle?.batteryCapacityKWh || 0,
          type: response.vehicleInfo.type || response.vehicle?.type || '',
          maxChargingPowerKW: response.vehicleInfo.maxChargingPowerKW || response.vehicle?.maxChargingPowerKW || 0,
          connectorType: response.vehicleInfo.connectorType || response.vehicle?.connectorType || '',
          registrationStatus: response.vehicleInfo.registrationStatus || response.vehicle?.registrationStatus || ''
        };
        
        console.log('✅ Vehicle info after mapping:', this.vehicleInfo);
      }
        
        // Khôi phục state realtime
        this.batteryPercent.set(response.currentState.batteryPercent);
        this.chargedKwh.set(response.currentState.chargedKwh);
        this.totalPrice.set(response.currentState.totalPrice);
        
        if (response.currentState.status === 'Idle') {
          this.isPaused = true;

          if (response.currentState.batteryPercent >= 99.9) { // Giả định Pin đầy là >= 99.9%
            this.isCompleted.set(true);
            console.log('✅ Khôi phục trạng thái: Pin đã đầy');
          }

          // Nếu còn thời gian ân hạn, bật countdown
          const remaining = response.currentState.graceTimeRemainingSeconds ?? 0;
          if (remaining > 0) {
            this.graceTimeRemain.set(remaining);
            this.startGraceCountdown(remaining);
            console.log(`⏰ Khôi phục ân hạn: ${remaining}s`);
          } else {
            // Đã hết ân hạn → set 0
            this.graceTimeRemain.set(0);
            console.log('⚠️ Đã hết thời gian ân hạn');
          }
        }
        this.cdr.markForCheck();

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
        if (err.status === 403) {
          this.toast.error('Bạn không có quyền truy cập phiên sạc này.');
          this.errorMessage.set('Phiên sạc này thuộc về người dùng khác.');
        } else {
          this.toast.error('Không thể khôi phục phiên sạc. Vui lòng bắt đầu mới.');
          this.errorMessage.set('Phiên sạc đã kết thúc hoặc không tồn tại.');
        }
      }
    });
  }

  // REFACTOR: Tách logic subscribe ra hàm riêng
  private subscribeToRealtimeUpdates() {
    this.realtimeSub = this.hubService.chargingUpdate$.subscribe(data => {
      if (!data) return;
      queueMicrotask(() => {
        this.batteryPercent.set(data.batteryPercentage ?? this.batteryPercent());
        this.chargedKwh.set(data.energyConsumed ?? this.chargedKwh());
        this.totalPrice.set(data.cost ?? this.totalPrice());
        this.timeRemain.set(data.timeRemainTotalSeconds ?? this.timeRemain());
        if (data.vehicleInfo) {
          this.vehicleInfo = {
            vehicleId: this.vehicleInfo?.vehicleId ?? 0,
            plate: data.vehicleInfo.plate,
            model: data.vehicleInfo.model,
            batteryCapacityKWh: data.vehicleInfo.batteryCapacityKWh,
            type: this.vehicleInfo?.type ?? '',
            maxChargingPowerKW: this.vehicleInfo?.maxChargingPowerKW ?? 0,
            connectorType: this.vehicleInfo?.connectorType ?? '',
            registrationStatus: this.vehicleInfo?.registrationStatus ?? ''
          } as Vehicles;
          this.cdr.markForCheck();
          console.log('✅ Đã cập nhật thông tin xe:', this.vehicleInfo);
        }
        if (!this.isPaused) {
          this.startCountdown();
        }
      });
    });

    this.stopSub = this.hubService.sessionStopped$.subscribe(id => {
      console.warn(`Phiên sạc ${id} đã dừng.`);
    });

    this.fullSub = this.hubService.sessionCompleted$.subscribe(id => {
      console.log(`Phiên sạc ${id} đã đầy pin.`);
      if (id === this.sessionId) {
        this.isCompleted.set(true);
        this.stopCountdown(); // ✅ Dừng đếm ngược timeRemain
        this.startGraceCountdown();
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
        this.isCompleted.set(true);
        this.stopCountdown(); // ✅ Dừng đếm ngược
        this.startGraceCountdown();

        // 2. Dừng đếm ngược
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.timeRemain.set(0);

        // 3. Thông báo khẩn cấp cho người dùng
        this.toast.error('Sạc đã dừng do không đủ tiền trong ví!'); 
        
        // Bạn cũng có thể set errorMessage để hiển thị một box đỏ lớn (tùy chọn)
        // this.errorMessage.set('Phiên sạc đã bị dừng do không đủ tiền.');
      }
    });

    this.idleFeeSub = this.hubService.idleFeeUpdate$.subscribe(data => {
      if (data.sessionId === this.sessionId) {
        console.log('Cập nhật phí phạt:', data);
        this.idleFee.set(data.idleFee || 0);
        this.overstayFee.set(data.overstayFee || 0);
      }
    });
  }

  private stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
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

  protected formatGraceTime(): string {
    const totalSeconds = this.graceTimeRemain();
    if (totalSeconds <= 0) return '00:00';

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

      // Gán sessionId trước khi gọi SignalR
      this.sessionId = session.id;
      this.saveSessionToLocalStorage(session.id);

      // ==== Kết nối SignalR
      this.presenceService.sendConnectCharging(Number(this.idPost), this.sessionId);

      const currentPost = this.postInfo();
      if (currentPost) {
        this.postInfo.set({
          ...currentPost,
          status: 'Occupied'
        });
      }

      this.hubService.startConnection();
      setTimeout(() => this.hubService.joinSession(this.sessionId), 1000);

      this.subscribeToRealtimeUpdates();
    },
    error: err => {
      console.error('Start session failed:', err);
      this.errorMessage.set('Không thể bắt đầu phiên sạc.');
    }
  });
}


  //  Lưu session vào localStorage để reconnect
  private saveSessionToLocalStorage(sessionId: number) {
    try {
      const now = new Date();
      // Cộng thêm 7 giờ (7 * 60 * 60 * 1000 ms)
      const vnTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
      const data = {
        sessionId: sessionId,
        postId: this.idPost,
        timestamp: vnTime.toISOString()
      };
      localStorage.setItem(`charging_post_${this.idPost}`, JSON.stringify(data));
      console.log(' Đã lưu sessionId vào localStorage');
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

  try {
      if (this.isPaused) {
        // Tiếp tục sạc
        console.log('🔄 Đang tiếp tục sạc...');
        await this.presenceService.sendConnectCharging(Number(this.idPost), this.sessionId);
        this.startSession();
        this.isPaused = false;
        this.stopGraceCountdown(); // ✅ Dừng đếm ngược ân hạn
        this.idleFee.set(0); // ✅ Reset phí phạt
        this.overstayFee.set(0);
        this.cdr.markForCheck();
        this.toast.success('Đã tiếp tục sạc');
      } else {
        // Dừng sạc
        console.log('⏸️ Đang dừng sạc...');
        this.chargingService.stopSession(this.sessionId).subscribe({
          next: async () => {
            console.log('✅ Backend confirmed stop');
            try {
              await this.presenceService.sendDisconnectCharging(Number(this.idPost), this.sessionId);
              console.log('✅ SignalR disconnect sent');
            } catch (signalRError) {
              console.error('⚠️ SignalR disconnect failed:', signalRError);
              // Không block flow chính
            }
            
            this.isPaused = true;
            this.stopCountdown(); // ✅ Dừng đếm ngược timeRemain
            this.startGraceCountdown(); // ✅ Bắt đầu đếm ngược ân hạn
            this.cdr.markForCheck();
            console.log('✅ Session paused successfully');
            this.toast.success('Tạm dừng sạc thành công');
          },
          error: (err) => {
            console.error('❌ Stop session failed:', err);
            this.toast.error('Dừng sạc thất bại: ' + (err.error?.message || err.message));
            this.cdr.markForCheck();
          },
          complete: () => {
            // ✅ QUAN TRỌNG: Reset isStopping trong mọi trường hợp
            this.isStopping = false;
            console.log('🔓 isStopping reset');
          }
        });
        return; // Thoát sớm để không chạy code bên dưới
      }
    } catch (error) {
      console.error('❌ Error in pressStopSession:', error);
      this.toast.error('Có lỗi xảy ra');
      this.cdr.markForCheck();
    } finally {
      // ✅ Đảm bảo reset isStopping cho trường hợp "Tiếp tục sạc"
      if (this.isPaused === false) {
        this.isStopping = false;
        this.cdr.markForCheck();
      }
    }
}

  // --- Kết thúc phiên sạc ---
  pressEndSession() {
    if (!this.sessionId) return;

    const confirmed = confirm('Bạn có chắc hoàn tất phiên sạc này không?');
    if (!confirmed) return;

    this.chargingService.completeSession(this.sessionId).subscribe({
      next: async (receipt) => {
        await this.presenceService.sendDisconnectCharging(Number(this.idPost), this.sessionId);
        this.presenceService.stopHubConnection(); // Dừng kết nối SignalR-ConnectCharging

        // 🗑️ XÓA LOCALSTORAGE
        localStorage.removeItem(`charging_post_${this.idPost}`);

        console.log(`${this.sessionId} EndSession successfully`);
        this.toast.success('Đã kết thúc phiên sạc thành công');
        // this.toast.success('Hóa đơn đã được gửi đến email của bạn');
        const hasIdleFees = (receipt.idleFee && receipt.idleFee > 0) || 
                            (receipt.overstayFee && receipt.overstayFee > 0);
        const isCashPayment = receipt.paymentMethod === 'Tiền mặt';
        
        if (!isCashPayment) {
          setTimeout(() => { window.location.href = '/lichsugiaodich'; }, 3000);
        } else {
          this.toast.success('Cảm ơn bạn đã sử dụng dịch vụ!');
          setTimeout(() => { window.location.href = '/'; }, 2000);
        }
        
      },
      error: (err) => {
        console.error('End session failed', err);
        this.toast.error('Hoàn tất sạc thất bại');
      }
    });
  }


  ngOnDestroy() {
    this.stopCountdown(); 
    this.stopGraceCountdown();
    if (this.sessionId) this.hubService.leaveSession(this.sessionId);
    this.realtimeSub?.unsubscribe();
    this.stopSub?.unsubscribe();
    this.fullSub?.unsubscribe();
    this.insufficientFundsSub?.unsubscribe();
    this.idleFeeSub?.unsubscribe();
    this.hubService.stopConnection();
    this.presenceService.stopHubConnection();
  }
}
