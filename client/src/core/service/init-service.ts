import { inject, Injectable } from '@angular/core';
import { AccountService } from './account-service';
import { Observable, of } from 'rxjs';
import { PresenceService } from './presence-service';
import { HubConnectionState } from '@microsoft/signalr';
import { ReservationService } from './reservation-service';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private accountService = inject(AccountService);
  private presenceService = inject(PresenceService);
  private reservationService =inject(ReservationService)
  init() {
    const accountString = localStorage.getItem('account');
    if(!accountString) return of(null);
    const account = JSON.parse(accountString);
    this.accountService.setCurrentUser(account);
    //signalR 
    if(this.presenceService.hubConnection?.state !== HubConnectionState.Connected) {
            this.presenceService.createHubConnection(account);
            this.reservationService.createHubConnection(account);
          }
    return of(null)
  }
}
