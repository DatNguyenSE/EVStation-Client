import { inject, Injectable } from '@angular/core';
import { AssignmentResponseDto } from '../../_models/user';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {

   private http = inject(HttpClient);
    baseUrl = 'https://localhost:5001/api/';

    getAssignment(idStaff: string) {
        return this.http.get<AssignmentResponseDto>(`${this.baseUrl}assignments/staff/${idStaff}`)
    }

    


  
}
