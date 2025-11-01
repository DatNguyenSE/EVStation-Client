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

  private sessionStoppedSubject = new Subject<any>();
  sessionStopped$ = this.sessionStoppedSubject.asObservable();

  private sessionCompletedSubject = new Subject<any>();
  sessionCompleted$ = this.sessionCompletedSubject.asObservable();

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

    //  Khi phiên sạc dừng (stop manual hoặc hết tiền)
    this.hubConnection.on('ReceiveSessionStopped', (data: any) => {
      console.warn(' Phiên sạc dừng:', data);
      this.sessionStoppedSubject.next(data);
    });

    //  Khi phiên sạc đầy pin
    this.hubConnection.on('ReceiveSessionFull', (data: any) => {
      console.log(' Phiên sạc hoàn tất:', data);
      this.sessionCompletedSubject.next(data);
    });

    // Khi lỗi
    this.hubConnection.on('ReceiveSessionError', (error: any) => {
      console.error(' Lỗi trong phiên sạc:', error);
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
