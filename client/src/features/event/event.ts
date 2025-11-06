import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { DriverService } from '../../core/service/driver-service';
import { CommonModule } from '@angular/common';
import { eventReservation } from '../../_models/reservation';

import { ActivatedRoute } from '@angular/router';
import { ReservationService } from '../../core/service/reservation-service';

@Component({
  selector: 'app-event',
  imports: [CommonModule],
  templateUrl: './event.html',
  styleUrl: './event.css'
})
export class Event implements OnInit{
  driverService = inject(DriverService);
  reservationSvc = inject(ReservationService);
  cdf = inject(ChangeDetectorRef)
  reservations = signal<eventReservation[]>([]);
  route = inject(ActivatedRoute);
  
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
        // ✅ Xóa phần tử vừa hủy khỏi danh sách hiện tại
        this.reservations.update(list => list.filter(r => r.id !== reservationId));
        
        // Không cần gọi lại LoadEventReservation(), vì BE đã không trả đơn bị hủy
      },
      error: (err) => {
        console.error(err);
        alert('Không thể hủy đặt chỗ. Vui lòng thử lại.');
      }
    });
  }
}
