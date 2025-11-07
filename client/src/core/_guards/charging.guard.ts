import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const chargingGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);

  const navigation = router.getCurrentNavigation();

  const canAccess = navigation?.extras?.state?.['allowAccess'];

  if (canAccess === true) {
    return true; // OK, cho phép truy cập
  }
  
  console.warn('Truy cập trực tiếp vào trang sạc bị từ chối. Đang chuyển hướng...');

  return router.createUrlTree(['/']);
};