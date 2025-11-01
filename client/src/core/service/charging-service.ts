import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

export interface CreateChargingSessionDto {
  postId: number;
  vehicleId: number,
  vehiclePlate?: string;
  reservationId: number;
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
  stopSession(sessionId: number): Observable<any> {
  return this.http.post(`${this.baseUrl}charging-sessions/${sessionId}/stop`, {});
}
  
  completeSession(sessionId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${sessionId}charging-sessions/complete`, {});
  }

  updatePlate(sessionId: number, plate: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${sessionId}charging-sessions/update-plate`, { plate });
  }

}
