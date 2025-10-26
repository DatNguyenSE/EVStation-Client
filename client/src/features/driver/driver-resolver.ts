import { ResolveFn } from '@angular/router';
import { DriverService } from '../../core/service/driver-service';
import { inject } from '@angular/core';
import { Driver } from '../../_models/user';

export const driverResolver: ResolveFn<Driver> = (route, state) => {
  const driverService = inject(DriverService)
  
  return driverService.loadDriverResolver();
};

