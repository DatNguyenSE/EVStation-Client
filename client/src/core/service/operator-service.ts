import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Account, AssignmentResponseDto, User } from '../../_models/user';
import { DtoStation } from '../../_models/station';

import { HttpClient } from '@angular/common/http';
import { ChargingSessionDetailDto } from '../../_models/session';

interface UpdatePlateResponse {
  id: number;
  vehicleId: number;
  vehicle: {
    id: number;
    type: string;
    model: string;
    batteryCapacityKWh: number;
    maxChargingPowerKW: number;
    connectorType: string;
    plate: string;
    ownerId: string;
    isActive: boolean;
    registrationStatus: string;
  };
  chargingPostId: number;
  vehiclePlate: string;
  startTime: string;
  status: string;
  // ... other fields
}

@Injectable({
  providedIn: 'root'
})
export class OperatorService {
  private http = inject(HttpClient);
  private apiUrl = environment;


  getAssignment(idStaff: string) {
    return this.http.get<AssignmentResponseDto>(`${this.apiUrl.apiUrl}assignments/staff/${idStaff}`)
  }

  UpdatePlateForWalkIn(sessionId: number, plate: string) {
    return this.http.post<any>(
      `${this.apiUrl.apiUrl}charging-sessions/${sessionId}/update-plate`,
      { plate } 
    );
  }

  getSessionDetail(sessionId: number) {
    return this.http.get<ChargingSessionDetailDto>(`${this.apiUrl.apiUrl}charging-sessions/${sessionId}/detail`);
  }

}
