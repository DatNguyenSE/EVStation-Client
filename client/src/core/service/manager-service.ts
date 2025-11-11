import { inject, Injectable } from '@angular/core';
import { AssignmentResponseDto } from '../../_models/user';
import { HttpClient } from '@angular/common/http';
import { Revenues } from '../../_models/revenue';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManagerService {

   private http = inject(HttpClient);
    baseUrl = 'https://localhost:5001/api/';

    getAssignment(idStaff: string) {
        return this.http.get<AssignmentResponseDto>(`${this.baseUrl}assignments/staff/${idStaff}`)
    }

     loadRevenuebystaion(startDate:string,endDate:string,granularity:string = 'Month',stationId:number) : Observable<Revenues[]>{
        return this.http.get<Revenues[]>(
    `${this.baseUrl}revenue?stationId=${stationId}&startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`);

       }


  
}
