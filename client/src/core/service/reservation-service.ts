import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { HubConnection } from '@microsoft/signalr';
import { eventReservation } from '../../_models/reservation';
import { Account } from '../../_models/user';
import * as signalR from '@microsoft/signalr';
import { ToastService } from './toast-service';
import { ReservationRequest, ReservationResponse } from '../../_models/reservation';


@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:5001/api';
  toast = inject(ToastService);
  
 createReservationChecked(req: ReservationRequest) {
  const start = new Date(req.timeSlotStart);
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();
  const countSlot = 1;

  if (diffMs < 0) {
    return throwError(() => new Error('Thời gian bắt đầu không được ở quá khứ.'));
  }
  if (diffMs > 24 * 60 * 60 * 1000) {
    return throwError(() => new Error('Chỉ được đặt chỗ trong 24h tới.'));
  }
  
  return this.checkAvailableSlots(req.chargingPostId).pipe(
    switchMap((availableSlotsMap) => {
     const selectedDay = req.timeSlotStart.substring(0, 10);

     // BE giờ trả về mảng object => cần map lại thành mảng string
     const availableSlotsRaw = availableSlotsMap[selectedDay] || [];
     const availableSlots = availableSlotsRaw.map((slotObj: any) => slotObj.startTime);
     

      const startTs = new Date(req.timeSlotStart).getTime();
      const isSlotAvailable = availableSlots.some(s => {
        const slotTs = new Date(s).getTime();
        return Math.abs(slotTs - startTs) < 60 * 1000;
      });

      if (!isSlotAvailable) {
        return throwError(() => new Error('Khung giờ này đã được đặt hoặc không khả dụng.'));
      }

      return this.http.post<ReservationResponse>(`${this.baseUrl}/reservation`,req);
    })
  );
}

  // check so slot cua post available
  // Sau (đúng kiểu BE trả về)
  checkAvailableSlots(postId: number) {
    return this.http.get<Record<string, { startTime: string; maxConsecutiveSlots: number }[]>>(
    `${this.baseUrl}/posts/${postId}/available-slots`
  );
}

  // lấy danh sách trụ sạc phù hợp với xe 
  getCompatiblePosts(stationId: number, vehicleId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/station/${stationId}/compatible-posts/${vehicleId}`);
  }

  LoadEventReservation() {
    return this.http.get<eventReservation[]>(`${this.baseUrl}/reservation/upcoming`);
  }

  cancelReservation(id:string){
    return this.http.post<ReservationResponse>(`${this.baseUrl}/reservation/${id}/cancel`,{});
  }

  //signalR Reservation
    private hubUrl = environment.hubUrl;
    hubConnection?: HubConnection;
    upcomingReservations = signal<eventReservation[]>([]);
  
    async createHubConnection(user: Account) {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(this.hubUrl + 'reservation', {
      accessTokenFactory: () => user.token
    })
    .withAutomaticReconnect()
    .build();

  this.hubConnection.on('UpdateUpcomingReservations', (reservations: eventReservation[]) => {
    console.log('Realtime update:', reservations);
    this.upcomingReservations.set(reservations);
    this.toast.success('Danh sách đặt chỗ đã được cập nhật', 2500);
  });

  try {
    await this.hubConnection.start();
    console.log('Successfully, Connected to ReservationHub');
  } catch (error) {
    console.error(' Error connecting to ReservationHub:', error);
  }
}
  
    stopHubConnection() {
      if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
        this.hubConnection.stop().catch(error => console.error(error));
      }
    }

}
