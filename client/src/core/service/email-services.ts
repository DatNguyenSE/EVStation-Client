import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Account } from '../../_models/user';

@Injectable({
  providedIn: 'root'
})
export class EmailServices {
  // private http: HttpClient = Inject(HttpClient);
  // protected router: Router = Inject(Router);
  baseUrl = 'https://localhost:5001/api';
 constructor(private http: HttpClient) {}
 
 confirmEmail(userId: string, token: string) {
  const params = { userId, token };
  return this.http.get<{ message: string }>(`${this.baseUrl}/account/confirm-email`, { params });
}

  
}
