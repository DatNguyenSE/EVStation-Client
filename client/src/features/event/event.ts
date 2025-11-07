import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { DriverService } from '../../core/service/driver-service';
import { CommonModule } from '@angular/common';
import { eventReservation } from '../../_models/reservation';

import { ActivatedRoute } from '@angular/router';
import { ReservationService } from '../../core/service/reservation-service';
import { HttpClient } from '@angular/common/http';
import { ReservationDetailModal } from '../reservation-detail/reservation-detail-modal';
import { ReservationDetail } from '../../_models/reservation-detail';
import { ToastService } from '../../core/service/toast-service';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [CommonModule, ReservationDetailModal],
  templateUrl: './event.html',
  styleUrl: './event.css'
})
export class Event implements OnInit{
  driverService = inject(DriverService);
  reservationSvc = inject(ReservationService);
  cdf = inject(ChangeDetectorRef)
  reservations = signal<eventReservation[]>([]);
  route = inject(ActivatedRoute);
  http = inject(HttpClient);
  toast = inject(ToastService);

  // Modal state
  showDetailModal = signal(false);
  selectedReservationDetail = signal<ReservationDetail | null>(null);
  loadingDetail = signal(false);

  openDetail(reservationId: number) {
    this.loadingDetail.set(true);
    this.showDetailModal.set(true);

    this.reservationSvc.getReservationDetail(reservationId).subscribe({
      next: (data) => {
        console.log('Chi tiết đặt chỗ:', data);
        this.selectedReservationDetail.set(data);
        this.loadingDetail.set(false);
      },
      error: (err) => {
        console.error('Lỗi API:', err);
        this.toast.error('Không thể tải chi tiết đặt chỗ');
        this.closeDetailModal();
      }
    });
  }

  closeDetailModal() {
    this.showDetailModal.set(false);
    this.selectedReservationDetail.set(null);
  }
  
  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    const ts = new Date().getTime(); 
    this.reservationSvc.LoadEventReservation(ts).subscribe({
      next: res => {
        this.reservations.set(res);
        this.cdf.detectChanges(); // đảm bảo render lần đầu
      },
      error: (err) => console.error(err)
    });
  }

  tatusBadgeClasses(status: string) {
    const base = 'text-white';
    switch ((status || '').toLowerCase()) {
    case 'confirmed':
    return base + ' bg-emerald-500';
    case 'cancelled':
    case 'canceled':
    return base + ' bg-red-500';
    case 'pending':
    return base + ' bg-yellow-500';
    default:
    return base + ' bg-gray-500';
    }
  }

  cancelReservation(reservationId: string): void {
    if (!confirm('Bạn có chắc muốn hủy đặt chỗ này không?')) return;

    this.reservationSvc.cancelReservation(reservationId).subscribe({
      next: () => {
        // CÁCH ĐÚNG: Cập nhật status, KHÔNG xóa
        this.reservations.update(list =>
          list.map(r => r.id === reservationId ? { ...r, status: 'Cancelled' } : r)
        );

        this.toast.success('Đã hủy đặt chỗ thành công');
      },
      error: (err) => {
        console.error(err);
        alert('Không thể hủy đặt chỗ. Vui lòng thử lại.');
      }
    });
  }
}
