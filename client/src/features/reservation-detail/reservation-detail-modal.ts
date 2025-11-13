import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationDetail } from '../../_models/reservation-detail';

@Component({
  selector: 'app-reservation-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-detail-modal.html'
})
export class ReservationDetailModal {
  detail = input<ReservationDetail | null>(null);
  close = output<void>();
}