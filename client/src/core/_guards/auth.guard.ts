import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../service/account-service';
import { ToastService } from '../service/toast-service';

export const authGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const toastr = inject(ToastService);
  const routers = inject(Router);

  if(accountService.currentAccount()) {
    return true;
  }else{
    toastr.error('You shall not pass!');
    console.log('You shall not pass!');
    routers.navigateByUrl('/');
    return false;
  }
};
