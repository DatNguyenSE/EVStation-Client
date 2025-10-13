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
    toastr.error('Đăng nhập để sử dụng!');
    console.log('You shall not pass!');
    routers.navigateByUrl('/dang-nhap');
    return false;
  }
};
