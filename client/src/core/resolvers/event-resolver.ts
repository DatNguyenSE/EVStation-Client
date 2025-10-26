import { ResolveFn } from '@angular/router';
import { DriverService } from '../service/driver-service';
import { inject } from '@angular/core';
import { eventReservation } from '../../_models/station';
import { ReservationService } from '../service/reservation-service';


export const eventResolver: ResolveFn<eventReservation[]> = (route, state) => {
  const reservationService = inject(ReservationService);
  
  return reservationService.LoadEventReservation();
};
