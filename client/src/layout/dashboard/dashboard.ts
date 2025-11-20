import { ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DriverService } from '../../core/service/driver-service';
import { CommonModule } from '@angular/common';
import { Vehicle } from "../../features/vehicle/vehicle";
import { GgMap } from "../../features/gg-map/gg-map";
import { PackagesService } from '../../core/service/packages-service';
import { MyPackage } from '../../_models/package';
import { ChargingSessionService } from '../../core/service/charging-service';
import { ChargingSessionHistory } from '../../_models/session';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { PaginationMeta } from '../../core/service/transaction-service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { AccountService } from '../../core/service/account-service';
import { ReplaySubject } from 'rxjs';
import { Activity } from 'botframework-schema';
import { environment } from '../../environments/environment.development';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Vehicle, GgMap],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  driverService = inject(DriverService);
  packageSvc = inject(PackagesService);
  accountService = inject(AccountService);
  driverPackage : MyPackage[] = []
  cdf = inject(ChangeDetectorRef);
  router = inject(Router);
  chargingService = inject(ChargingSessionService);

  pagination = signal<PaginationMeta>({ currentPage: 1, pageSize: 5, totalPages: 1, totalCount: 0 });
  paginatedHistory: ChargingSessionHistory[] = [];
  isLoadingHistory = true;

  // Bot-related properties
  hubConnection!: HubConnection;
  directLine: any;
  activitySubject = new ReplaySubject<Activity>(5);
  user = {
    id: 'driver-' + Math.random().toString(36).substr(2, 9),
    name: 'Driver User'
  };
  bot = {
    id: 'bot-1',
    name: 'EV Charging Bot'
  };

  isChatOpen = signal(false);
  isBotLoading = signal(true);
  isBotConnectionError = signal(false);

  get totalPages() { return this.pagination().totalPages; }
  get currentPage() { return this.pagination().currentPage; }
  get hasPreviousPage() { return this.currentPage > 1; }
  get hasNextPage() { return this.currentPage < this.totalPages; }
  
  ngOnInit(): void {
    this.driverService.loadDriverProfile();
    this.loadDriverPackage();   
    this.loadChargeHistory(1);
    
    // Initialize bot connection
    this.initializeBotConnection();
  }

  private initializeBotConnection() {
    // console.log(' [Dashboard] initializeBotConnection() called');
    
    const acc = this.accountService.currentAccount();
    const token = acc?.token ?? '';
    // Use http(s) for negotiate endpoint; SignalR will upgrade to websocket automatically
    const hubUrl = environment.hubUrl + 'bot';

    // 1. Khởi tạo Hub Connection
    if (!this.hubConnection) {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => token || ''
        })
        .withAutomaticReconnect()
        .build();
    }

    // Update user info from driver service
    const driver = this.driverService.currentDriver();
    if (driver) {
      this.user.id = driver.id || this.user.id;
      this.user.name = driver.fullName || this.user.name;
    }

    // 2. "Giả lập" đối tượng DirectLine
    this._setupDirectLine();

    // 3. Lắng nghe tin nhắn TỪ Bot
    this.listenForBotMessages();

    // 4. Bắt đầu kết nối SignalR (và render UI khi thành công)
    this.startSignalRConnection();
    
    // Render Web Chat
    // console.log('[Dashboard] About to call renderWebChatContainer()');
    // try {
    //   this.renderWebChatContainer();
    //   console.log(' [Dashboard] renderWebChatContainer() call completed');
    // } catch (err) {
    //   console.error(' [Dashboard] renderWebChatContainer() threw error:', err);
    // }
  }

  private _setupDirectLine() {
    // console.log(' [_setupDirectLine] Setting up custom DirectLine object');

    // Tạo một Observable từ Subject
    const createObservable = (subject: ReplaySubject<any>) => ({
      subscribe: (observer: any) => subject.subscribe(observer)
    });

    // Web Chat cần connectionStatus$ để biết trạng thái (2 = Connected)
    const connectionStatusSubject = new ReplaySubject<number>(1);
    connectionStatusSubject.next(2);

    this.directLine = {
      activity$: createObservable(this.activitySubject),
      connectionStatus$: createObservable(connectionStatusSubject),

      //Hàm Web Chat gọi khi NGƯỜI DÙNG gửi tin nhắn
      postActivity: (activity: Activity) => {
        // console.log(' [User] Gửi:', activity.text);
        const id = activity.id || Math.random().toString(36).substr(2, 9);

        // Hiển thị tin nhắn gửi đi lên UI ngay lập tức
        const outgoing: Activity = {
          ...activity, id,
          from: activity.from || this.user,
          recipient: activity.recipient || this.bot,
          timestamp: activity.timestamp || new Date(),
          channelId: activity.channelId || 'signalr'
        } as Activity;
        this.activitySubject.next(outgoing);

        // Optimistically emit the outgoing activity so the UI displays it (prevents "failed to send")
        // try {
        //   this.activitySubject.next(outgoing);
        //   console.log(' [postActivity] Optimistically pushed outgoing activity to activitySubject', outgoing.id);
        // } catch (emitErr) {
        //   console.error('[postActivity] Error pushing outgoing activity to subject:', emitErr);
        // }

        if (activity.type === 'message' && activity.text) {
          this.hubConnection.invoke('SendMessage', activity.text)
            .catch(err => {
              console.error(' [Bot] Lỗi gửi tin nhắn:', err);
              // TODO: Có thể gửi 1 activity lỗi về UI
            });
        }

        // Trả về một object "giống" Observable để Web Chat không báo lỗi
        return { subscribe: (obs: any) => (obs.next || obs)(id) };

        // Web Chat may expect postActivity to return an Observable-like with subscribe().
        // Return a small object implementing subscribe so Web Chat can subscribe without error.
        // return {
        //   subscribe: (observer: any) => {
        //     try {
        //       if (typeof observer === 'function') {
        //         observer(id);
        //       } else {
        //         observer.next && observer.next(id);
        //         observer.complete && observer.complete();
        //       }
        //     } catch (err) {
        //       console.warn(' [postActivity] subscribe handler threw:', err);
        //     }
        //     return { unsubscribe: () => {} };
        //   }
        // };
      }
    };
  }

  private startSignalRConnection() {
    // console.log(' [Bot] Đang bắt đầu kết nối SignalR...');
    this.hubConnection.start()
      .then(() => {
        // console.log(' [Bot] Kết nối SignalR thành công!');
        // Chỉ render WebChat SAU KHI SignalR kết nối
        this.renderWebChatContainer();
      })
      .catch((err: any) => {
        console.error('❌ [Bot] Lỗi kết nối SignalR:', err);
        this.isBotConnectionError.set(true);
        this.isBotLoading.set(false);
      });
  }

  private listenForBotMessages() {
    this.hubConnection.on('ReceiveMessage', (message: string) => {
      // console.log(' [Bot] Nhận:', message);

      const activity = {
        type: 'message',
        from: this.bot,
        recipient: this.user,
        text: message,
        timestamp: new Date(),
        id: Math.random().toString(36).substr(2, 9),
        channelId: 'signalr'
      } as Activity;

      this.activitySubject.next(activity);
    });
  }

  private renderWebChatContainer() {
    const tryRender = async () => {
      try {
        const container = document.getElementById('webchat');
        if (!container) {
          // console.warn(' [Bot] Chưa tìm thấy #webchat, thử lại sau 250ms');
          setTimeout(tryRender, 250);
          return;
        }

        let WebChat = (window as any).WebChat;

        // Nếu global WebChat chưa có, thử dynamic import từ package (bundled)
        if (!WebChat) {
          try {
            // console.log(' [Bot] Đang import động botframework-webchat...');
            const mod = await import('botframework-webchat');
            WebChat = (mod && (mod as any).default) ? (mod as any).default : mod;
            (window as any).WebChat = WebChat; // Lưu lại
          } catch (impErr) {
            console.error(' [Bot] Lỗi import động:', impErr);
            setTimeout(tryRender, 500); // Đợi lâu hơn nếu lỗi
            return;
          }
        }

        if (WebChat && typeof WebChat.renderWebChat === 'function') {
          try {
            WebChat.renderWebChat(
              {
                directLine: this.directLine,
                userID: this.user.id,
                username: this.user.name,
                styleOptions: {
                  bubbleTextColor: 'Black',
                  bubbleBackground: 'rgb(200, 200, 200)'
                }
              },
              container
            );
            // console.log(' [Bot] Render Web Chat thành công!');
            this.isBotLoading.set(false); // Báo hiệu bot đã sẵn sàng
          } catch (renderErr) {
            console.error(' [Bot] Lỗi renderWebChat:', renderErr);
            this.isBotConnectionError.set(true);
            this.isBotLoading.set(false);
          }
          
          // debug sau render - WAIT LONGER for UI to fully render
          setTimeout(() => {
            // console.log(' [tryRender] After render - container children:', container.childElementCount, 'innerHTML length:', container.innerHTML?.length ?? 0);
              // Try to find send button - broaden detection and enumerate buttons for diagnosis
              const textarea = container.querySelector('textarea') || container.querySelector('input[type="text"]');
              // console.log('[tryRender] Textarea/Input found:', !!textarea);

              const buttons = Array.from(container.querySelectorAll('button')) as HTMLButtonElement[];
              // console.log(' [tryRender] Found buttons count:', buttons.length);
              buttons.forEach((b, i) => {
                // console.log(` [tryRender] button[${i}] class=`, b.className, 'aria-label=', b.getAttribute('aria-label'), 'title=', b.title, 'type=', b.type, 'innerText=', (b.innerText || '').trim());
                // If button contains an SVG (common for send icon), log svg details
                const svg = b.querySelector('svg');
                // if (svg) console.log(` [tryRender] button[${i}] contains SVG, svg classes:`, svg.getAttribute('class'));
              });

              // Heuristic: try common webchat send button selectors
              const sendButton = container.querySelector('.webchat__send-box__button, .webchat-send__button, button.send, button[aria-label*="Gửi"], button[aria-label*="Send"]') as HTMLButtonElement | null;
              // console.log(' [tryRender] Heuristic send button found:', !!sendButton);

              // Add a delegated click logger to capture clicks and show event targets (non-invasive)
              const clickLogger = (ev: MouseEvent) => {
                try {
                  const t = ev.target as HTMLElement;
                  // console.log(' [tryRender] CLICK event on element:', t.tagName, 'class=', t.className, 'aria-label=', t.getAttribute?.('aria-label'));
                } catch (e) {
                  // console.log(' [tryRender] CLICK event (error reading target)');
                }
              };
              container.removeEventListener('click', clickLogger as any);
              container.addEventListener('click', clickLogger as any);
            
            if (sendButton) {
              // console.log(' [tryRender]  Web Chat UI is ready for interaction');
            } else {
              // console.warn(' [tryRender]  Send button not found - Web Chat may not be fully initialized');
            }
          }, 1000); // INCREASED WAIT from 200ms to 1000ms
        } else {
          // console.warn('[Bot] WebChat.renderWebChat không tồn tại, thử lại...');
          setTimeout(tryRender, 250);
        }
      } catch (err) {
        console.error('[tryRender] Caught error:', err);
      }
    };

    tryRender();
  }

  loadChargeHistory(page: number) {
    this.isLoadingHistory = true;
    this.chargingService.getHistory(page, this.pagination().pageSize).subscribe({
      next: (res) => {
        this.paginatedHistory = res?.sessions ?? []; //  đảm bảo không undefined
        this.pagination.set(res?.pagination ?? {
          currentPage: 1, pageSize: 5, totalPages: 1, totalCount: 0
        });
        this.isLoadingHistory = false;
        this.cdf.detectChanges();
      },
      error: (err) => {
        console.error("Lỗi tải lịch sử sạc:", err);
        this.paginatedHistory = []; //  fallback
        this.isLoadingHistory = false;
        this.cdf.detectChanges();
      }
    });
  }

  nextPage() {
    if (this.hasNextPage) this.loadChargeHistory(this.currentPage + 1);
  }

  prevPage() {
    if (this.hasPreviousPage) this.loadChargeHistory(this.currentPage - 1);
  }

  loadDriverPackage(){
    this.packageSvc.getMyPackage().subscribe({
      next : (res) =>{
        //  this.driverPackage = res;
        this.driverPackage = Array.isArray(res) ? res : []; 
         console.log('Gói cước của tài xế:', this.driverPackage);
         this.cdf.detectChanges();
      },
      error :(err) =>{
        console.log("Lỗi Load Package",err);
        this.driverPackage = [];
      }
    })
  }

  cancelPackage(id: number) {
    Swal.fire({
      title: 'Xác nhận huỷ?',
      text: 'Bạn có chắc muốn huỷ gói này? Hành động không thể hoàn tác.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Huỷ gói',
      cancelButtonText: 'Đóng',
      confirmButtonColor: '#d33'
    }).then(result => {
      if (result.isConfirmed) {
        this.packageSvc.cancelPackage(id).subscribe({
          next: () => {
            Swal.fire('Thành công', 'Gói đã được huỷ.', 'success');
            this.driverPackage = this.driverPackage.filter(pkg => pkg.id !== id);
            this.cdf.detectChanges();
          },
          error: (err) => {
            console.error('Huỷ gói lỗi:', err);
            Swal.fire('Lỗi', 'Không thể huỷ gói.', 'error');
          }
        });
      }
    });
  }
 
  viewSessionDetail(id: number) {
    this.router.navigate(['/phien-sac', id]);
  }

  getRemainingDays(endDate: Date): number {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  
}

