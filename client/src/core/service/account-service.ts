import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Account } from '../../_models/user';
import { map, ReplaySubject } from 'rxjs';
import { Router } from '@angular/router';
import { clearHttpCache } from '../interceptors/loading-interceptor';
import {jwtDecode} from 'jwt-decode';
import { environment } from '../../environments/environment.development';
import { ReservationService } from '../../core/service/reservation-service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  private reservationService = inject(ReservationService);
  protected router = inject(Router);
  baseUrl = environment.apiUrl;
  currentAccount = signal<Account | null>(null);

  setCurrentAccount(acc: Account) {
    const decodedToken: any = jwtDecode(acc.token);
    const roles = this.getRolesFromDecodedToken(decodedToken);
    Array.isArray(roles) ? acc.roles = roles : acc.roles.push(roles);
    localStorage.setItem('account', JSON.stringify(acc));
    this.currentAccount.set(acc);
  }

  login(creds: any) {
    return this.http.post<Account>(this.baseUrl+'account/login',creds).pipe(        //.pipe(...): Cho phép bạn xử lý dữ liệu trả về trước khi gửi ra ngoài.
      map(account => {                                                           //map() dùng để biến đổi dữ liệu.
        if(account) {
          localStorage.setItem("account", JSON.stringify(account)); 
                     // đổi về dạng object -> txtjson sau đó muốn lấy thì JSON.parse(localStorage.getItem("user")) 
          this.setCurrentAccount(account);     
          
          // KẾT NỐI SIGNALR REALTIME
        this.reservationService.createHubConnection(account);
        }
        return account;
      })
    )
  }
  
   register(creds: any) {
    return this.http.post<Account>(this.baseUrl+'account/register',creds) //.pipe(...): Cho phép bạn xử lý dữ liệu trả về trước khi gửi ra ngoài.
  }

  logout() {
    localStorage.removeItem('account');
    this.currentAccount.set(null);
    this.reservationService.stopHubConnection();
    clearHttpCache();
    window.location.href = '/';
  }

  private getRolesFromDecodedToken(decodedToken: any): string[] {
    let roles = decodedToken.role;
    if (!Array.isArray(roles)) {
      roles = [roles]; // nếu có 1 role thì p chuyển thành mảng vì ở bên HasRoleDirective phải là mảng mới xài được  '.some()'
    }
    return roles;
  }

  //  private getRolesFromToken(acc: Account): string[] {
  //   const payload = acc.token.split('.')[1];
  //   const decoded = atob(payload);
  //   const jsonPayload = JSON.parse(decoded);
  //   return Array.isArray(jsonPayload.role) ? jsonPayload.role : [jsonPayload.role]
  // }
}
