import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Account, User } from '../../_models/user';
import { map } from 'rxjs';
import { AccountService } from './account-service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  protected router = inject(Router);
  baseUrl = 'https://localhost:5001/api/';
  currentUser = signal<User | null>(null);


  profile(id : string) {
    return this.http.get<User>(this.baseUrl + 'users/' +id);
  }
}
