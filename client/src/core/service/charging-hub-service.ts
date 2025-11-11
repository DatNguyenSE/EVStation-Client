import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChargingHubService {
  private hubConnection?: signalR.HubConnection;

  // Subject để đẩy dữ liệu realtime ra ngoài component
  private chargingUpdateSubject = new Subject<any>();
  chargingUpdate$ = this.chargingUpdateSubject.asObservable();

  private sessionUpdateSubject = new Subject<any>();
  public sessionUpdate$ = this.sessionUpdateSubject.asObservable();

  private sessionStoppedSubject = new Subject<any>();
  sessionStopped$ = this.sessionStoppedSubject.asObservable();

  private sessionCompletedSubject = new Subject<any>();
  sessionCompleted$ = this.sessionCompletedSubject.asObservable();

  private insufficientFundsSubject = new Subject<any>();
  insufficientFunds$ = this.insufficientFundsSubject.asObservable();

  private idleFeeUpdateSubject = new Subject<any>();
  idleFeeUpdate$ = this.idleFeeUpdateSubject.asObservable();

  private reservationExpiredSubject = new Subject<any>();
  public reservationExpired$ = this.reservationExpiredSubject.asObservable();

  private errorStopPostSubject = new Subject<any>();
  public errorStopPost$ = this.errorStopPostSubject.asObservable();

  private isConnecting = false;


  startConnection(): void {
    if (this.hubConnection || this.isConnecting) return;
    this.isConnecting = true;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:5001/hubs/charging') //  URL backend
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          console.warn('Reconnecting...', retryContext.previousRetryCount);
          return 3000; // delay 3s mỗi lần reconnect
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // --- Kết nối ---
    this.hubConnection
      .start()
      .then(() => {
        console.log(' Connected to ChargingHub');
        this.isConnecting = false;
      })
      .catch(err => {
        console.error(' Failed to connect ChargingHub:', err);
        this.isConnecting = false;
        // Tự thử lại nếu backend chưa khởi động
        setTimeout(() => this.startConnection(), 5000);
      });

    // --- Sự kiện kết nối ---
    this.hubConnection.onreconnecting(() => {
      console.warn(' Reconnecting to ChargingHub...');
    });

    this.hubConnection.onreconnected(id => {
      console.log('Reconnected to ChargingHub, connectionId:', id);
    });

    this.hubConnection.onclose(err => {
      console.warn('Disconnected from ChargingHub:', err);
      this.hubConnection = undefined;
    });

    // --- Lắng nghe các sự kiện realtime từ backend ---
    this.registerEventHandlers();
  }

  // -- các sự kiên: 
  private registerEventHandlers(): void {
    if (!this.hubConnection) return;

    //  Cập nhật: Tên event khớp với backend (ReceiveEnergyUpdate)
    this.hubConnection.on('ReceiveEnergyUpdate', (data: any) => {
      console.log(' Nhận cập nhật sạc realtime:', data);
      this.chargingUpdateSubject.next(data);
    });

    this.hubConnection.on('ReceiveSessionUpdate', (data) => {
      console.log('🔄 Nhận session update:', data);
      this.sessionUpdateSubject.next(data);
    });

    //  Khi phiên sạc dừng (stop manual)
    this.hubConnection.on('ReceiveSessionStopped', (data: any) => {
      console.warn(' Phiên sạc dừng:', data);
      this.sessionStoppedSubject.next(data);
    });

    //  Khi phiên sạc đầy pin
    this.hubConnection.on('ReceiveSessionFull', (data: any) => {
      console.log(' Phiên sạc hoàn tất:', data);
      this.sessionCompletedSubject.next(data);
    });

    // Khi dừng sạc do hết tiền (khớp với tên sự kiện)
    this.hubConnection.on('ReceiveSessionStopped_InsufficientFunds', (sessionId: any, status: any) => {
      console.error('PHÁT HIỆN HẾT TIỀN!:', { sessionId, status });
      this.insufficientFundsSubject.next({ sessionId, status });
    });

    this.hubConnection.on('ReceiveIdleFeeUpdated', (data: any) => {
      console.log('Cập nhật phí phạt:', data);
      this.idleFeeUpdateSubject.next(data);
    });

    this.hubConnection.on('ReceiveReservationExpired', (data) => {
      console.warn('Nhận thông báo hết giờ đặt chỗ:', data);
      this.reservationExpiredSubject.next(data);
    });

    // Khi lỗi
    this.hubConnection.on('ReceiveSessionEnded', (data) => {
      console.error(' Lỗi trong phiên sạc:', data);
      this.errorStopPostSubject.next(data);
    });
  }

  
  joinSession(sessionId: number): void {
    if (!this.hubConnection) return;

    this.hubConnection.invoke('JoinSessionGroup', sessionId)
      .then(() => console.log(` Joined group session-${sessionId}`))
      .catch(err => console.error('JoinSessionGroup error:', err));
  }

  leaveSession(sessionId: number): void {
    if (!this.hubConnection) return;

    this.hubConnection.invoke('LeaveSessionGroup', sessionId)
      .then(() => console.log(` Left group session-${sessionId}`))
      .catch(err => console.error('LeaveSessionGroup error:', err));
  }

  
  stopConnection(): void {
    if (!this.hubConnection) return;
    this.hubConnection.stop()
      .then(() => {
        console.log(' Disconnected from ChargingHub');
        this.hubConnection = undefined;
      })
      .catch(err => console.error('Error stopping hub:', err));
  }
}
