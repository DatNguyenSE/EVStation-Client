import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Revenues } from '../../_models/revenue';

@Injectable({
  providedIn: 'root'
})
export class RevenueService {
   private http = inject(HttpClient);
   private baseUrl = 'https://localhost:5001/api';

   loadRevenue(startDate:string,endDate:string,granularity:string = 'Month') : Observable<Revenues[]>{
    return this.http.get<Revenues[]>(`${this.baseUrl}/revenue?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}`);
   }
}
