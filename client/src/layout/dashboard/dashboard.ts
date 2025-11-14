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
    console.log('🤖 [Dashboard] initializeBotConnection() called');
    
    const acc = this.accountService.currentAccount();
    const token = acc?.token ?? '';
    // Use http(s) for negotiate endpoint; SignalR will upgrade to websocket automatically
    const hubUrl = 'http://localhost:5000/hubs/bot';
    
    console.log('🔗 Using Bot Hub URL:', hubUrl);
    console.log('🔗 Token available:', !!token);

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
      console.log('🤖 [Dashboard] Updated user:', this.user);
    }

    // Setup DirectLine BEFORE starting connection
    this._setupDirectLine();

    // Start connection
    this.startSignalRConnection();

    // Register listener
    console.log('📥 [listenForBotMessages] Listener registered');
    this.listenForBotMessages();
    
    // Render Web Chat
    console.log('🎨 [Dashboard] About to call renderWebChatContainer()');
    try {
      this.renderWebChatContainer();
      console.log('🎨 [Dashboard] renderWebChatContainer() call completed');
    } catch (err) {
      console.error('🎨 [Dashboard] renderWebChatContainer() threw error:', err);
    }
  }

  private _setupDirectLine() {
    console.log('🎨 [_setupDirectLine] Setting up custom DirectLine object');

    const createObservable = (subject: any) => ({
      subscribe: (observer: any) => {
        console.log('🎨 [Observable.subscribe] Subscriber connected');
        const subscription = subject.subscribe(observer);
        return {
          unsubscribe: () => {
            console.log('🎨 [Observable] Subscriber disconnected');
            subscription.unsubscribe();
          }
        };
      }
    });

    // Create connectionStatus with initial CONNECTED state (value 2)
    const connectionStatusSubject = new ReplaySubject<number>(1);
    connectionStatusSubject.next(2); // 2 = CONNECTED in Web Chat

    this.directLine = {
      activity$: createObservable(this.activitySubject),
      connectionStatus$: createObservable(connectionStatusSubject),
      postActivity: (activity: Activity) => {
        console.log('📤 [postActivity] User sent:', activity);
        console.log('📤 [postActivity] activity.type:', activity.type, 'activity.text:', activity.text);
        const id = activity.id || Math.random().toString(36).substr(2, 9);

        // Build an activity object to push into activitySubject so Web Chat shows it as sent
        const outgoing: Activity = {
          ...activity,
          id,
          from: activity.from || this.user,
          recipient: activity.recipient || this.bot,
          timestamp: activity.timestamp || new Date(),
          channelId: activity.channelId || 'signalr'
        } as Activity;

        // Optimistically emit the outgoing activity so the UI displays it (prevents "failed to send")
        try {
          this.activitySubject.next(outgoing);
          console.log('📤 [postActivity] Optimistically pushed outgoing activity to activitySubject', outgoing.id);
        } catch (emitErr) {
          console.error('❌ [postActivity] Error pushing outgoing activity to subject:', emitErr);
        }

        if (activity.type === 'message' && activity.text) {
          console.log('📤 [postActivity] Sending message via SignalR:', activity.text);
          this.hubConnection.invoke('SendMessage', activity.text)
            .then((result: any) => {
              console.log('✅ [postActivity] SignalR.SendMessage succeeded, result:', result);
            })
            .catch((err: any) => {
              console.error('❌ [postActivity] SignalR.SendMessage error:', err);
              // Optionally, emit an activity update indicating failure (left as future improvement)
            });
        } else {
          console.log('📤 [postActivity] Skipping send - not a message');
        }

        console.log('📤 [postActivity] Returning activity ID:', id);

        // Web Chat may expect postActivity to return an Observable-like with subscribe().
        // Return a small object implementing subscribe so Web Chat can subscribe without error.
        return {
          subscribe: (observer: any) => {
            try {
              if (typeof observer === 'function') {
                observer(id);
              } else {
                observer.next && observer.next(id);
                observer.complete && observer.complete();
              }
            } catch (err) {
              console.warn('📤 [postActivity] subscribe handler threw:', err);
            }
            return { unsubscribe: () => {} };
          }
        };
      }
    };
  }

  private startSignalRConnection() {
    console.log('🔗 [startSignalRConnection] Attempting to start connection');
    this.hubConnection.start()
      .then(() => {
        console.log('✅ Bot Hub Connection started');
        console.log('🔗 Hub connection state:', this.hubConnection.state);
        console.log('🔗 Hub connection ID:', this.hubConnection.connectionId);
      })
      .catch((err: any) => console.error('❌ Error while starting Bot Hub connection:', err));
  }

  private listenForBotMessages() {
    this.hubConnection.on('ReceiveMessage', (message: string) => {
      console.log('📥 [listenForBotMessages] Bot sent:', message);
      console.log('📥 [listenForBotMessages] activitySubject observers count:', (this.activitySubject as any).observers?.length || 0);

      const activity = {
        type: 'message',
        from: this.bot,
        recipient: this.user,
        text: message,
        timestamp: new Date(),
        id: Math.random().toString(36).substr(2, 9),
        channelId: 'signalr'
      } as Activity;

      console.log('📥 [listenForBotMessages] Pushing activity to subject, activity:', activity);
      this.activitySubject.next(activity);
      console.log('✅ [listenForBotMessages] Activity pushed successfully');
    });
  }

  private renderWebChatContainer() {
    console.log('🎨 [renderWebChatContainer] starting');
    const tryRender = async () => {
      try {
        console.log('🎨 [tryRender] iteration start');
        const container = document.getElementById('webchat');
        console.log('🎨 [tryRender] container found:', !!container);
        if (!container) {
          console.warn('🎨 [tryRender] container #webchat not found, will retry');
          setTimeout(tryRender, 250);
          return;
        }

        let WebChat = (window as any).WebChat;
        console.log('🎨 [tryRender] window.WebChat exists:', !!WebChat);

        // Nếu global WebChat chưa có, thử dynamic import từ package (bundled)
        if (!WebChat) {
          console.log('🎨 [tryRender] Attempting dynamic import of botframework-webchat...');
          try {
            const mod = await import('botframework-webchat');
            console.log('🎨 [tryRender] Dynamic import resolved, mod type:', typeof mod);
            WebChat = (mod && (mod as any).default) ? (mod as any).default : mod;
            // expose cho debug
            (window as any).WebChat = WebChat;
            console.log('🎨 [tryRender] WebChat assigned from import, renderWebChat exists:', typeof WebChat?.renderWebChat);
          } catch (impErr) {
            console.error('🎨 [tryRender] Dynamic import error:', impErr);
            setTimeout(tryRender, 500);
            return;
          }
        }

        if (WebChat && typeof WebChat.renderWebChat === 'function') {
          console.log('🎨 [tryRender] WebChat.renderWebChat is callable, attempting render...');
          console.log('🎨 [tryRender] directLine:', this.directLine);
          console.log('🎨 [tryRender] directLine.activity$:', this.directLine?.activity$);
          console.log('🎨 [tryRender] directLine.activity$.subscribe:', typeof this.directLine?.activity$?.subscribe);
          console.log('🎨 [tryRender] directLine.postActivity:', typeof this.directLine?.postActivity);
          
          try {
            console.log('🎨 [tryRender] Calling WebChat.renderWebChat...');
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
            console.log('✅ [tryRender] Web Chat rendered successfully');
          } catch (renderErr) {
            console.error('❌ [tryRender] renderWebChat threw error:', renderErr);
            // Still continue - Web Chat may have partially rendered
          }
          
          // debug sau render - WAIT LONGER for UI to fully render
          setTimeout(() => {
            console.log('🎨 [tryRender] After render - container children:', container.childElementCount, 'innerHTML length:', container.innerHTML?.length ?? 0);
              // Try to find send button - broaden detection and enumerate buttons for diagnosis
              const textarea = container.querySelector('textarea') || container.querySelector('input[type="text"]');
              console.log('🎨 [tryRender] Textarea/Input found:', !!textarea);

              const buttons = Array.from(container.querySelectorAll('button')) as HTMLButtonElement[];
              console.log('🎨 [tryRender] Found buttons count:', buttons.length);
              buttons.forEach((b, i) => {
                console.log(`🎨 [tryRender] button[${i}] class=`, b.className, 'aria-label=', b.getAttribute('aria-label'), 'title=', b.title, 'type=', b.type, 'innerText=', (b.innerText || '').trim());
                // If button contains an SVG (common for send icon), log svg details
                const svg = b.querySelector('svg');
                if (svg) console.log(`🎨 [tryRender] button[${i}] contains SVG, svg classes:`, svg.getAttribute('class'));
              });

              // Heuristic: try common webchat send button selectors
              const sendButton = container.querySelector('.webchat__send-box__button, .webchat-send__button, button.send, button[aria-label*="Gửi"], button[aria-label*="Send"]') as HTMLButtonElement | null;
              console.log('🎨 [tryRender] Heuristic send button found:', !!sendButton);

              // Add a delegated click logger to capture clicks and show event targets (non-invasive)
              const clickLogger = (ev: MouseEvent) => {
                try {
                  const t = ev.target as HTMLElement;
                  console.log('🎨 [tryRender] CLICK event on element:', t.tagName, 'class=', t.className, 'aria-label=', t.getAttribute?.('aria-label'));
                } catch (e) {
                  console.log('🎨 [tryRender] CLICK event (error reading target)');
                }
              };
              container.removeEventListener('click', clickLogger as any);
              container.addEventListener('click', clickLogger as any);
            
            if (sendButton) {
              console.log('🎨 [tryRender] ✅ Web Chat UI is ready for interaction');
            } else {
              console.warn('🎨 [tryRender] ⚠️ Send button not found - Web Chat may not be fully initialized');
            }
          }, 1000); // INCREASED WAIT from 200ms to 1000ms
        } else {
          console.log('🎨 [tryRender] WebChat.renderWebChat not available, retrying...');
          setTimeout(tryRender, 250);
        }
      } catch (err) {
        console.error('🎨 [tryRender] Caught error:', err);
      }
    };

    console.log('🎨 [renderWebChatContainer] calling tryRender()');
    tryRender();
  }

  loadChargeHistory(page: number) {
    this.isLoadingHistory = true;
    this.chargingService.getHistory(page, this.pagination().pageSize).subscribe({
      next: (res) => {
        this.paginatedHistory = res?.sessions ?? []; // ✅ đảm bảo không undefined
        this.pagination.set(res?.pagination ?? {
          currentPage: 1, pageSize: 5, totalPages: 1, totalCount: 0
        });
        this.isLoadingHistory = false;
        this.cdf.detectChanges();
      },
      error: (err) => {
        console.error("Lỗi tải lịch sử sạc:", err);
        this.paginatedHistory = []; // ✅ fallback
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

