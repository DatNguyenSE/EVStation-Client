import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TechnicainService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:5001/api';

  getMyTask(){
    
  }
}
