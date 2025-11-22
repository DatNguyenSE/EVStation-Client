import { ChangeDetectorRef, Component, inject, OnInit, signal, effect, untracked, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Reports } from '../../_models/report';
import { AccountService } from '../../core/service/account-service';
import { ReportService } from '../../core/service/report-service';

// Định nghĩa kiểu dữ liệu cho UI
export type NotificationUI = Reports & { read: boolean };

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css'
})
export class Notification implements OnInit {

  reportService = inject(ReportService);
  protected accountService = inject(AccountService);
  protected router = inject(Router);

  // 1. Signal chứa danh sách thông báo
  notificationItems = signal<NotificationUI[]>([]);

  // 2. Computed: Tự động tính số lượng tin chưa đọc
  // Sửa lỗi "Parser Error" trong HTML
  unreadCount = computed(() =>
    this.notificationItems().filter(item => !item.read).length
  );

  constructor() {
    // EFFECT: Đồng bộ dữ liệu từ Service -> UI
    effect(() => {
      const rawReports = this.reportService.notificationsReport();

      // Dùng untracked để lấy giá trị hiện tại mà KHÔNG gây vòng lặp vô hạn
      const currentItems = untracked(() => this.notificationItems());

      const uiReports: NotificationUI[] = rawReports.map(report => {
        // Tìm xem thông báo này đã tồn tại trong danh sách cũ chưa
        const existingItem = currentItems.find(x => x.id === report.id);

        return {
  ...report, // <-- ĐÚNG: Chỉ lấy các trường của object report hiện tại
  read: existingItem ? existingItem.read : false
}
      });

      this.notificationItems.set(uiReports);
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    const role = this.accountService.currentAccount()?.roles?.[0] || '';
    if (role?.includes('admin')) {
      this.reportService.loadReportsAdmin();
    }
  }

  // Đánh dấu tất cả là đã đọc
  markAllAsRead() {
    this.notificationItems.update(items =>
      items.map(item => ({ ...item, read: true }))
    );
  }

  // Đánh dấu 1 cái là đã đọc (hàm nội bộ)
  private markAsRead(id: number) {
    this.notificationItems.update(items =>
      items.map(item => item.id === id ? { ...item, read: true } : item)
    );
  }

  // Hàm xử lý khi click vào 1 dòng thông báo
  goToReports(report: NotificationUI) {
    // 1. Đánh dấu tin này là đã đọc
    this.markAsRead(report.id);

    // 2. Chuyển hướng trang
    this.router.navigate(['/quan-tri-vien/bao-cao']);
  }
}