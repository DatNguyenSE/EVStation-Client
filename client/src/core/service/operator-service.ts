import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Account, AssignmentResponseDto, User } from '../../_models/user';
import { DtoStation } from '../../_models/station';

import { HttpClient } from '@angular/common/http';
import { ChargingSessionDetailDto } from '../../_models/session';

@Injectable({
  providedIn: 'root'
})
export class OperatorService {
  private http = inject(HttpClient);
  private apiUrl = environment;


  getAssignment(idStaff: string) {
    return this.http.get<AssignmentResponseDto>(`${this.apiUrl.apiUrl}assignments/${idStaff}`)
  }

  UpdatePlateForWalkIn(sessionId :number, plateNumber: string) {
    return this.http.post<void>(`${this.apiUrl.apiUrl}charging-sessions/${sessionId}/update-plate`,{plateNumber});
  }
  getSessionDetail(sessionId: number) {
    return this.http.get<ChargingSessionDetailDto>(`${this.apiUrl.apiUrl}charging-sessions/${sessionId}/detail`);
  }

}
