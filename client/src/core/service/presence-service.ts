import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { ToastService } from './toast-service';
import { Account, User } from '../../_models/user';
import * as signalR from '@microsoft/signalr';
import { HubConnection } from '@microsoft/signalr';


@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private hubUrl = environment.hubUrl;
  private toast = inject(ToastService);
  hubConnection?: HubConnection;
  
  createHubConnection(user : Account) {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(this.hubUrl+'presence',{
      accessTokenFactory: () => user.token
    })
    .withAutomaticReconnect()//giúp tự kết nối lại khi mạng chập chờn.
    .build();

        
    this.hubConnection.on('UserOnline', username => {
      this.toast.success(username + ' has connected',3500)
    });
       this.hubConnection.on('UserOffline', username => {
      this.toast.info(username + ' has disconnected',3500);
    });
    try {
     this.hubConnection.start();
    console.log('Successfully, Connected to PresenceHub');
  } catch (error) {
    console.error(' Error connecting to PresenceHub:', error);
  }

 
  }

  stopHubConnection() {
    if(this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      this.hubConnection.stop().catch(error => console.log(error))
    }
  }
}
