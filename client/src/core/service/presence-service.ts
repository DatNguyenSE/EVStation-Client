import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { ToastService } from './toast-service';
import * as signalR from '@microsoft/signalr';
import { HubConnection } from '@microsoft/signalr';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from './account-service';


@Injectable({
  providedIn: 'root'
})
export class PresenceService {


  private hubUrl = environment.hubUrl;
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);

 
  hubConnection?: HubConnection;
  
// hiện đang để cho API tự lắng nghe tất cả các trụ sạc, khi có trụ nào kết nối thì server sẽ gửi thông báo đến tất cả client đang kết nối
 async createHubConnection() {
   const userRole = this.accountService.currentAccount()?.roles[0]
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.hubUrl}connect-charging`)
      //   , {
      //   accessTokenFactory: () => user.token // không cần token vì không có xác thực người dùng
      // })
      .withAutomaticReconnect()//giúp tự kết nối lại khi mạng chập chờn.
      .build();


    this.hubConnection.on('ConnectCharging', postId => {
  if (userRole === 'Operator') {
    this.toast.success(`Trụ số-${postId} đang hoạt động`, 4000);
  }
});

this.hubConnection.on('DisconnectCharging', postId => {
  if (userRole === 'Operator') {
    this.toast.warning(`Trụ số-${postId} đã ngắt kết nối`, 4000);
  }
});
    try {
      this.hubConnection.start();
      console.log('Successfully, Connected to ChargingConnection');
    } catch (error) {
      console.error(' Error connecting to ChargingConnection:', error);
    }


  }

  sendConnectCharging(postId: string) { //gọi thủ công
    this.hubConnection?.invoke('NotifyConnect', postId) /// Gọi tới hàm NotifyConnect trong Hub (không phải NotifyDisconnect)
      .then(() => console.log(` Sent NotifyConnect for postId=${postId}`))
    .catch(err => console.error(' NotifyConnect error:', err));
  }

  sendDisconnectCharging(postId: string) {//gọi thủ công
    this.hubConnection?.invoke('NotifyDisconnect', postId) //gọi tới Hàm NotifyDisconnect trong Hub
       .then(() => console.log(` Sent NotifyDisconnect for postId=${postId}`))
    .catch(err => console.error(' NotifyDisconnect error:', err));
  }


  async stopHubConnection() {
  if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
    try {
      await this.hubConnection.stop();
      console.log('Disconnected from ChargingConnection');
    } catch (error) {
      console.error('Error stopping SignalR connection:', error);
    }
  }
}
}
