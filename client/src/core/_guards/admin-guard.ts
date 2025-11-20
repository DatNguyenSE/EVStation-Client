import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../service/account-service';
import { inject } from '@angular/core';
import { ToastService } from '../service/toast-service';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const toast = inject(ToastService);
  const router = inject(Router);
  if (accountService.currentAccount()?.roles.includes('Admin') ) {
      return true;
  } else {
    toast.error('Bạn không được cấp phép để truy cập');
    router.navigate(['/']);
    return false;
  }
};
