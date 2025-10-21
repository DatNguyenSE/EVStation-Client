import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

export interface ReservationRequest {
  vehicleId: number;
  chargingPostId: number;
  timeSlotStart: string;
  slotCount: number;
}

export interface ReservationResponse {
  id?: number;
  message?: string;
  success?: boolean;
  createdAt?: string;
}
@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:5001/api';

 createReservationChecked(req: ReservationRequest) {
  const start = new Date(req.timeSlotStart);
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();

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
  
  cancelReservation(id:number){
    return this.http.post<ReservationResponse>(`${this.baseUrl}/reservation/${id}/cancel`,{});
  }
}
