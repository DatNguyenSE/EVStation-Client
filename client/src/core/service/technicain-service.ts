import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Repair, Task } from '../../_models/report';

@Injectable({
  providedIn: 'root'
})
export class TechnicainService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:5001/api';

  getMyTask(){
    const noCache = Date.now()
    return this.http.get<Task[]>(`${this.baseUrl}/reports/mytasks?noCache=${noCache}`);
  }

  startRepair(id:number){
    return this.http.post<Repair>(`${this.baseUrl}/reports/${id}/start-repair`,{});
  }

  completeRepair(id:number,formData : FormData){
    return this.http.post<Repair>(`${this.baseUrl}/reports/${id}/complete`,formData);
  }
}
