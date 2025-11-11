import { Component, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ReportService } from '../../core/service/report-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css'
})
export class Notification implements OnInit, OnDestroy {
  private reportService = inject(ReportService);

  notifications: any[] = [];
  unreadCount = 0;
  isDropdownOpen = false;
  private subs: Subscription[] = [];

  ngOnInit(): void {
    console.log('🔔 Notification component loaded!');

    // ✅ Load dữ liệu từ localStorage trước (để hiện ngay khi reload trang)
    const stored = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    this.notifications = stored;
    this.unreadCount = this.reportService.getAdminUnreadCount();

    // 🔔 Lắng nghe realtime từ ReportService (SignalR push event)
    const sub = this.reportService.adminNotifications$.subscribe(noti => {
      console.log('📬 Notifications cập nhật:', noti);
      this.notifications = noti;
      this.unreadCount = this.reportService.getAdminUnreadCount();
    });

    this.subs.push(sub);
  }

  /** 🔄 Toggle mở/đóng dropdown khi click vào chuông */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /** ✅ Đánh dấu tất cả đã đọc */
  markAllAsRead(): void {
    this.reportService.markAdminAllAsRead();
    this.unreadCount = 0;
  }

  /** ❌ Đóng dropdown khi click ra ngoài */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    // Nếu click ra ngoài phần tử có class .notification-wrapper thì đóng dropdown
    if (!target.closest('.notification-wrapper')) {
      this.isDropdownOpen = false;
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}
