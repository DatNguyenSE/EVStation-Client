import { ResolveFn } from '@angular/router';

import { inject } from '@angular/core';

import { ReservationService } from '../service/reservation-service';
import { eventReservation } from '../../_models/reservation';


export const eventResolver: ResolveFn<eventReservation[]> = (route, state) => {
  const reservationService = inject(ReservationService);
  
  return reservationService.LoadEventReservation();
};
