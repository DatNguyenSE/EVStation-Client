import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { AssignResponse, EvaluateReportRequest, EvaluateResponse, Reports } from '../../_models/report';
import { Account } from '../../_models/user';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
   private hubConnection!: signalR.HubConnection;
  private notificationsSource = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSource.asObservable();

  private hubUrl = environment.hubUrl;
  private baseUrl = 'https://localhost:5001/api/';
  private http = inject(HttpClient);
   notifications = signal<any[]>([]); 

  getReports(){
    const noCache = Date.now()
    return this.http.get<Reports[]>(`${this.baseUrl}reports?noCache=${noCache}`,{
      headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
    });
    
  }
  getReportsById(id:number){
      return this.http.get<Reports>(`${this.baseUrl}reports/${id}`);
  }

  evaluteReport(id:number, evaluteReport : EvaluateReportRequest){
        return this.http.post<EvaluateResponse>(`${this.baseUrl}reports/${id}/evaluate`, evaluteReport);
  }
   assignTechnician(id: number, technicianId: string): Observable<AssignResponse> {
    return this.http.post<AssignResponse>(`${this.baseUrl}reports/${id}/assign`, { technicianId });
  }
  closeReport(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}reports/${id}/close`, {});
  }

  uploadReport(formData : FormData){
    return this.http.post<Reports>(`${this.baseUrl}reports`,formData);

  }
 

    isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }


    

  // 🔌 Khởi tạo kết nối tới ReportHub
createHubConnection(user: Account): void {
   if (this.isConnected()) return;
  const hubUrl = `${this.hubUrl}notification`;
  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => user.token
    })
    .withAutomaticReconnect()
    .build();

  this.hubConnection
  .start()
  .then(() => console.log('✅ Connected to notificationHub:'))
  .catch(err => console.error('❌ ReportHub connection error:', err));

  this.listenForNotifications();
}
  
reconnectIfNeeded(): void {
  const storedAccount = localStorage.getItem('account');
  if (!this.isConnected() && storedAccount) {
    const user = JSON.parse(storedAccount);
    this.createHubConnection(user);
  }
}


  // 🧰 Lắng nghe sự kiện công việc mới (nếu admin muốn thấy phản hồi)
 private listenForNotifications(): void {
  this.hubConnection.on('ReceiveNotification', (notification) => {
    console.log('🧰 New task notification:', notification);

    // 🔹 Lưu thông báo vào localStorage để giữ khi reload
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = [{ ...notification, read: false }, ...stored];
    localStorage.setItem('notifications', JSON.stringify(updated));

    // 🔹 Cập nhật BehaviorSubject cho UI hiển thị real-time
    this.notificationsSource.next(updated);
  });
}
getUnreadCount(): number {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    return stored.filter((n: any) => !n.read).length;
  }

  markAllAsRead(): void {
    const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
    const updated = stored.map((n: any) => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updated));
    this.notificationsSource.next(updated);
  }

  // 🚀 Gửi công việc tới kỹ thuật viên
  assignTaskToTechnician(technicianId: string, task: any): void {
    this.hubConnection.invoke('AssignTaskToTechnician', technicianId, task)
      .then(() => console.log(`📨 Task sent to technician ${technicianId}`))
      .catch(err => console.error('❌ Error sending task:', err));
  }

  // ❌ Ngắt kết nối
  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => console.log('🔌 Disconnected from ReportHub'));
    }
  }
  
}
