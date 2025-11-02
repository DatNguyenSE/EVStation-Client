import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { Observable, of } from 'rxjs';
import { PresenceService } from './presence-service';
import { HubConnectionState } from '@microsoft/signalr';
import { ReservationService } from './reservation-service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private accountService = inject(AccountService);
  private presenceService = inject(PresenceService);
  private reservationService =inject(ReservationService)
  private router = inject(Router);
  init() {
    const accountString = localStorage.getItem('account');
    if(!accountString) return of(null);
    const account = JSON.parse(accountString);
    this.accountService.setCurrentAccount(account);
    const currentUrl = this.router.url;
      if (this.accountService.currentAccount()?.roles.includes('Admin')  && !currentUrl.startsWith('/quan-tri-vien')) {
        this.router.navigate(['/quan-tri-vien']);
      }
      if (this.accountService.currentAccount()?.roles.includes('Operator')  && !currentUrl.startsWith('/quan-tri-vien')) {
        this.router.navigate(['/nhan-vien-tram/trang-chu']);
      }
    //signalR 
    if(this.presenceService.hubConnection?.state !== HubConnectionState.Connected) {
            this.presenceService.createHubConnection(account);
            this.reservationService.createHubConnection(account);
          }
    return of(null)
  }
}
