import { ResolveFn } from '@angular/router';
import { DriverService } from '../service/driver-service';
import { inject } from '@angular/core';
import { eventReservation } from '../../_models/station';


export const eventResolver: ResolveFn<eventReservation[]> = (route, state) => {
  const driverService = inject(DriverService);
  
  return driverService.GetEventReservation();
};
