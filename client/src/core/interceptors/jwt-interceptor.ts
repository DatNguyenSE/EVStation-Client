import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AccountService } from '../service/account-service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const accountService = inject(AccountService);

  const user = accountService.currentAccount();

  if (user) { 
    req = req.clone({
      setHeaders: {                                 // Option?[headers params responseType observe]
        Authorization: `Bearer ${user.token}`
      }
    })
  }  

  return next(req);
};
