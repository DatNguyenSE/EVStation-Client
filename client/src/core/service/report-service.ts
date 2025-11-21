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
  // notifications$ = this.notificationsSource.asObservable();

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
      .set('pageNumber', filter.pageNumber.toString())
      .set('pageSize', filter.pageSize.toString());

    if (filter.postCode) params = params.set('postCode', filter.postCode);
    if (filter.technicianId) params = params.set('technicianId', filter.technicianId);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.severity) params = params.set('severity', filter.severity);
    // ... set thêm các filter khác nếu cần

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
  isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  loadReportsAdmin() {
    return this.http.get<Reports[]>(`${this.baseUrl}reports/new`).subscribe({
      next : res => this.notificationsReport.set(res)
    });
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
    });

    this.hubConnection.on('FixCompleted', (notificationId: number) => {
    console.log(' ADMIN Event: FixCompleted', notificationId);

    this.loadReportsAdmin();
    this.toast.success("Có công việc đã hoàn thành", 4000);
    });

    // === SỰ KIỆN CHO TECHNICIAN ===
    this.hubConnection.on('TaskCompleted', (message: string) => {
      console.log('🧑‍🔧 TECHNICIAN Event: TaskCompleted', message);
      // (Dòng này giờ sẽ chạy đúng vì 'taskCompletedSource' là rxjs Subject)
      this.taskCompletedSource.next(message);
      this.toast.success(`Công việc của bạn đã được hoàn thành, cảm ơn`, 4000);
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
