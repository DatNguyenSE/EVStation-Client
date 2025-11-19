import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AssignResponse, EvaluateReportRequest, EvaluateResponse, Reports, Task } from '../../_models/report';
import { Account } from '../../_models/user';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
   private hubConnection!: signalR.HubConnection;
  private notificationsSource = new BehaviorSubject<any[]>([]);
  // notifications$ = this.notificationsSource.asObservable();

  private hubUrl = environment.hubUrl;
  private baseUrl = 'https://localhost:5001/api/';
  private http = inject(HttpClient);
  //  notifications = signal<any[]>([]); 

  private adminNotificationsSource = new BehaviorSubject<any[]>([]);
  adminNotifications$ = this.adminNotificationsSource.asObservable();

  private taskCompletedSource = new Subject<string>(); // Gửi cả object Task mới
  taskCompleted$ = this.taskCompletedSource.asObservable();

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

  console.log('[ReportService] Attempting connection. User object:', user);
    if (!user || !user.token) {
      console.error('❌ [ReportService] Connection FAILED: Token is null or empty.');
      return; // Dừng lại nếu không có token
    }
    console.log('[ReportService] Token (first 20 chars):', user.token.substring(0, 20));

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

  this.startListeningToAllEvents();
}

  private startListeningToAllEvents(): void {
    
    // === SỰ KIỆN CHO ADMIN ===
    this.hubConnection.on('NewReportReceived', (message: string) => {
      console.log('👑 ADMIN Event: NewReportReceived', message);
      const stored = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      const newNotification = { message, receivedAt: new Date(), read: false };
      const updated = [newNotification, ...stored];
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
      this.adminNotificationsSource.next(updated);
    });
    
    this.hubConnection.on('FixCompleted', (message: string) => {
      console.log('👑 ADMIN Event: FixCompleted', message);
      const stored = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
      const newNotification = { message, receivedAt: new Date(), read: false };
      const updated = [newNotification, ...stored];
      localStorage.setItem('admin_notifications', JSON.stringify(updated));
      this.adminNotificationsSource.next(updated);
    });

    // === SỰ KIỆN CHO TECHNICIAN ===
    this.hubConnection.on('TaskCompleted', (message: string) => {
      console.log('🧑‍🔧 TECHNICIAN Event: TaskCompleted', message);
      // (Dòng này giờ sẽ chạy đúng vì 'taskCompletedSource' là rxjs Subject)
      this.taskCompletedSource.next(message);
    });
  }

  
reconnectIfNeeded(): void {
  const storedAccount = localStorage.getItem('account');
  if (!this.isConnected() && storedAccount) {
    const user = JSON.parse(storedAccount);
    this.createHubConnection(user);
  }
}

  getAdminUnreadCount(): number {
    const stored = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    return stored.filter((n: any) => !n.read).length;
  }

  markAdminAllAsRead(): void {
    const stored = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const updated = stored.map((n: any) => ({ ...n, read: true }));
    localStorage.setItem('admin_notifications', JSON.stringify(updated));
    this.adminNotificationsSource.next(updated);
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
