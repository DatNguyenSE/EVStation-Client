import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ChargingSessionDetailDto, ChargingSessionHistory } from '../../_models/session';
import { PaginationMeta } from './transaction-service';

export interface CreateChargingSessionDto {
  postId: number;
  vehicleId?: number,
  vehiclePlate?: string;
  reservationId?: number;
}

export interface ChargingSessionDto {
  id: number;
  vehicleId: number;
  vehiclePlate: string;
  postId: number;
  reservationId: number;
  startTime: string;
  endTime?: string | null;
  startBatteryPercentage: number;
  endBatteryPercentage?: number | null;
  energyConsumed: number;
  status: string;
  cost: number;
}

@Injectable({
  providedIn: 'root'
})

export class ChargingSessionService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  startSession(dto: CreateChargingSessionDto): Observable<ChargingSessionDto> {
    return this.http.post<ChargingSessionDto>(`${this.baseUrl}charging-sessions/start`, dto);
  }

  reconnectSession(sessionId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}charging-sessions/${sessionId}/reconnect`);
  }
  
  stopSession(sessionId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}charging-sessions/${sessionId}/stop`, {});
  }
 

  completeSession(sessionId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}charging-sessions/${sessionId}/complete`, {});
  }

  updatePlate(sessionId: number, plate: string): Observable<any> {
    return this.http.post(`${this.baseUrl}${sessionId}/charging-sessions/update-plate`, { plate });
  }

  validateScan(postID :number): Observable<any>{
    return this.http.post(`${this.baseUrl}charging/validate-scan?postId=${postID}`,{});
  }

  // getHistory(): Observable<ChargingSessionHistory[]> {
  //   return this.http.get<ChargingSessionHistory[]>(`${this.baseUrl}charging-sessions/history`);
  // }

  getHistory(page: number = 1, pageSize: number = 5): Observable<{sessions: ChargingSessionHistory[], pagination: PaginationMeta}> {
    const params = new HttpParams()
      .set('pageNumber', page)
      .set('pageSize', pageSize);

    return this.http.get<{sessions: ChargingSessionHistory[], pagination: PaginationMeta}>(
        `${this.baseUrl}charging-sessions/history`,
        { params }
    );
  }

  getSessionDetail(sessionId: number) {
    return this.http.get<ChargingSessionDetailDto>(`${this.baseUrl}charging-sessions/${sessionId}/detail`);
  }
}
