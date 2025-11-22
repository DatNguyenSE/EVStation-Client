import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../service/account-service';
import { ToastService } from '../service/toast-service';

export const staffGuard: CanActivateFn = () => {
  const accountService = inject(AccountService);
  const toastr = inject(ToastService);
  const routers = inject(Router);

  const roles = accountService.currentAccount()?.roles || [];
if ( roles.includes('Operator') || roles.includes('Technician') || roles.includes('Manager')) {
  return true;
}else{
    toastr.error('Đăng kí làm thành viên của chúng tôi!');
    console.log('You shall not pass!');
    routers.navigateByUrl('/dang-nhap');
    return false;
  }
};
