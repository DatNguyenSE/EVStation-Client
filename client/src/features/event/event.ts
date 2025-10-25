import { Component, inject, OnInit, signal } from '@angular/core';
import { DriverService } from '../../core/service/driver-service';
import { CommonModule } from '@angular/common';
import { eventReservation } from '../../_models/station';

import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-event',
  imports: [CommonModule],
  templateUrl: './event.html',
  styleUrl: './event.css'
})
export class Event implements OnInit{
  driverService = inject(DriverService);
  reservations = signal<eventReservation[] | null> (null);

  constructor(private route: ActivatedRoute) {}
  
  ngOnInit(): void {
  this.route.data.subscribe({
      next: data => this.reservations.set(data['event'])
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
}
