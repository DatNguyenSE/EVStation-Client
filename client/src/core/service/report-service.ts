import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AssignResponse, EvaluateReportRequest, EvaluateResponse, ReportFilterParams, Reports, Task } from '../../_models/report';
import { Account } from '../../_models/user';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ToastService } from './toast-service';
import { PaginatedResult } from '../../_models/receipt';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private hubConnection!: signalR.HubConnection;
  notificationsReport = signal<Reports[]>([])
  
  private shouldRefreshReportsSource = new Subject<void>();
  shouldRefreshReports$ = this.shouldRefreshReportsSource.asObservable();

  private newTaskAssignedSource = new Subject<string>();
  newTaskAssigned$ = this.newTaskAssignedSource.asObservable();

  private hubUrl = environment.hubUrl;
  private baseUrl = 'https://localhost:5001/api/';
  private http = inject(HttpClient);

  private taskCompletedSource = new Subject<string>(); // Gửi cả object Task mới
  taskCompleted$ = this.taskCompletedSource.asObservable();
  toast = inject(ToastService);

  getReports(filter: ReportFilterParams): Observable<PaginatedResult<Reports>> {
    const page = (filter.pageNumber && !isNaN(filter.pageNumber)) ? filter.pageNumber : 1;
    const size = (filter.pageSize && !isNaN(filter.pageSize)) ? filter.pageSize : 10;
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', size.toString())
      .set('_t', new Date().getTime().toString());

    if (filter.postCode) params = params.set('postCode', filter.postCode);
    if (filter.technicianId) params = params.set('technicianId', filter.technicianId);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.severity) params = params.set('severity', filter.severity);
  return this.http.get<PaginatedResult<Reports>>(`${this.baseUrl}reports`, { params });
}

  getReportsById(id: number) {
    return this.http.get<Reports>(`${this.baseUrl}reports/${id}`);
  }

  evaluteReport(id: number, evaluteReport: EvaluateReportRequest) {
    return this.http.post<EvaluateResponse>(`${this.baseUrl}reports/${id}/evaluate`, evaluteReport);
  }
  assignTechnician(id: number, technicianId: string): Observable<AssignResponse> {
    return this.http.post<AssignResponse>(`${this.baseUrl}reports/${id}/assign`, { technicianId });
  }
  closeReport(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}reports/${id}/close`, {});
  }

  uploadReport(formData: FormData) {
    return this.http.post<Reports>(`${this.baseUrl}reports`, formData);

  }

  loadReportsAdmin() {
    return this.http.get<Reports[]>(`${this.baseUrl}reports/new`).subscribe({
      next : res => this.notificationsReport.set(res)
    });
  }
  
  isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  //  Khởi tạo kết nối tới ReportHub
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
      .then(() => console.log(' Connected to notificationHub:'))
      .catch(err => console.error(' ReportHub connection error:', err));

    this.startListeningToAllEvents();
  }

  private startListeningToAllEvents(): void {

    this.hubConnection.on('NewReportReceived', (notificationReport: Reports) => {
      console.log(' ADMIN Event: NewReportReceived', notificationReport);

      this.notificationsReport.update(list => [notificationReport, ...list]);

      this.toast.warning(`Có báo cáo sự cố mới tại trụ -${notificationReport.postId}`, 5000);
      this.shouldRefreshReportsSource.next();
    });

    this.hubConnection.on('FixCompleted', (message: string) => {
      console.log(' ADMIN Event: FixCompleted', message);

      this.loadReportsAdmin();
      this.toast.success(message, 4000);
      this.shouldRefreshReportsSource.next();
    });

    // === SỰ KIỆN CHO TECHNICIAN ===
    this.hubConnection.on('TaskCompleted', (message: string) => {
      console.log('🧑‍🔧 TECHNICIAN Event: TaskCompleted', message);
      // (Dòng này giờ sẽ chạy đúng vì 'taskCompletedSource' là rxjs Subject)
      this.taskCompletedSource.next(message);
      this.toast.success(message, 4000);
    });

    this.hubConnection.on('NewTaskAssigned', (message: string) => {
      console.log('🧑‍🔧 TECHNICIAN Event: NewTaskAssigned', message);
      
      // 1. Hiện thông báo Toast ngay lập tức
      this.toast.info(message, 5000);

      // 2. Bắn tín hiệu sang Component để reload danh sách
      this.newTaskAssignedSource.next(message);
    });
  }

  //  Gửi công việc tới kỹ thuật viên
  assignTaskToTechnician(technicianId: string, task: any): void {
    this.hubConnection.invoke('AssignTaskToTechnician', technicianId, task)
      .then(() => console.log(` Task sent to technician ${technicianId}`))
      .catch(err => console.error(' Error sending task:', err));
  }

  //  Ngắt kết nối
  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => console.log('🔌 Disconnected from ReportHub'));
    }
  }

}
