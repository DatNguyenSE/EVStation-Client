import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { ToastService } from './toast-service';
import * as signalR from '@microsoft/signalr';
import { HubConnection } from '@microsoft/signalr';
import { AccountService } from './account-service';
import { Subject } from 'rxjs';

export interface ChargingEvent {
  postId: number;
  sessionId: number;
}

@Injectable({
  providedIn: 'root'
})
export class PresenceService {

  private hubUrl = environment.hubUrl;
  private toast = inject(ToastService);
  private accountService = inject(AccountService);

  hubConnection?: HubConnection;

  sessionConnected$ = new Subject<ChargingEvent>();
  sessionDisconnected$ = new Subject<ChargingEvent>();

  // ================== Tạo kết nối SignalR ==================
  async createHubConnection() {
    const userRole = this.accountService.currentAccount()?.roles[0];

    // Nếu đã có kết nối, dừng trước
    if (this.hubConnection) {
      await this.stopHubConnection();
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.hubUrl}connect-charging`)
      .withAutomaticReconnect() // tự reconnect mà không cần lưu gì
      .build();

    // Xử lý sự kiện khi trụ bắt đầu sạc
    this.hubConnection.on('ConnectCharging', (data: ChargingEvent) => {
      console.log(' ConnectCharging:', data);
      if (userRole === 'Operator') {
        this.toast.success(`Trụ số-${data.postId} bắt đầu sạc (Session #${data.sessionId})`, 4000);
      }
      this.sessionConnected$.next(data);
    });

    // Xử lý sự kiện khi trụ ngắt sạc
    this.hubConnection.on('DisconnectCharging', (data: ChargingEvent) => {
      console.log(' DisconnectCharging:', data);
      if (userRole === 'Operator') {
        this.toast.warning(`Trụ số-${data.postId} đã ngắt kết nối (Session #${data.sessionId})`, 4000);
      }
      this.sessionDisconnected$.next(data);
    });

    try {
      await this.hubConnection.start();
      console.log(' Connected to ChargingConnection');
    } catch (error) {
      console.error(' Error connecting to ChargingConnection:', error);
      // Tự động retry sau vài giây
      setTimeout(() => this.createHubConnection(), 5000);
    }
  }

  // ================== Gửi sự kiện thủ công ==================
  sendConnectCharging(postId: number, sessionId: number) {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) return;
    const payload = { postId, sessionId };
    this.hubConnection.invoke('NotifyConnect', payload)
      .then(() => console.log('Sent NotifyConnect:', payload))
      .catch(err => console.error('NotifyConnect error:', err));
  }

  sendDisconnectCharging(postId: number, sessionId: number) {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) return;
    const payload = { postId, sessionId };
    this.hubConnection.invoke('NotifyDisconnect', payload)
      .then(() => console.log('Sent NotifyDisconnect:', payload))
      .catch(err => console.error('NotifyDisconnect error:', err));
  }

  // ================== Dừng kết nối ==================
  async stopHubConnection() {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.hubConnection.stop();
        console.log('Disconnected from ChargingConnection');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
    this.hubConnection = undefined;
  }
}
