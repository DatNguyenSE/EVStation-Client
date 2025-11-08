import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private hubConnection!: signalR.HubConnection;
  private reportsSource = new BehaviorSubject<any[]>([]);
  reports$ = this.reportsSource.asObservable();

  // 👉 Chỉ cần define 1 lần base URL
  private hubUrl = environment.hubUrl;

  constructor() {}

  // 🔌 Khởi tạo kết nối tới ReportHub
  startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.hubUrl}report`, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('✅ Connected to ReportHub'))
      .catch(err => console.error('❌ SignalR connection error:', err));

    this.listenForReports();
  }

  // 🧠 Lắng nghe sự kiện report mới từ server
  private listenForReports(): void {
    this.hubConnection.on('ReceiveReport', (report) => {
      console.log('📢 New report received:', report);
      const current = this.reportsSource.value;
      this.reportsSource.next([report, ...current]);
    });
  }

  // ❌ Dừng kết nối (nếu cần)
  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => console.log('🔌 Disconnected from ReportHub'));
    }
  }
}
