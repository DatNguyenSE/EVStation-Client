import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Account } from '../../_models/user';
import { map } from 'rxjs';
import { Router } from '@angular/router';
import { clearHttpCache } from '../interceptors/loading-interceptor';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private http = inject(HttpClient);
  protected router = inject(Router);
  baseUrl = 'https://localhost:5001/api/';
  currentAccount = signal<Account | null>(null);


  login(creds: any) {
    return this.http.post<Account>(this.baseUrl+'account/login',creds).pipe(        //.pipe(...): Cho phép bạn xử lý dữ liệu trả về trước khi gửi ra ngoài.
      map(account => {                                                           //map() dùng để biến đổi dữ liệu.
        if(account) {
          localStorage.setItem("account", JSON.stringify(account)); 
                     // đổi về dạng object -> txtjson sau đó muốn lấy thì JSON.parse(localStorage.getItem("user")) 
          this.currentAccount.set(account);         
        }
      })
    )
  }
  
   register(creds: any) {
    return this.http.post<Account>(this.baseUrl+'account/register',creds) //.pipe(...): Cho phép bạn xử lý dữ liệu trả về trước khi gửi ra ngoài.
  }

  logout() {
    localStorage.removeItem("account"); 
    this.currentAccount.set(null);
    clearHttpCache();
    this.router.navigate(['/']);
  }

}
