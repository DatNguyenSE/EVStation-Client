import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs';
import { ToastService } from '../service/toast-service';
import { Router } from '@angular/router';

  
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);

  // Hàm dịch lỗi sang tiếng Việt
  const translateError = (message: string): string => {
    const translations: Record<string, string> = {
      'The Password field is required.': 'Vui lòng nhập mật khẩu.',
      'The Username field is required.': 'Vui lòng nhập tên đăng nhập.',
      'Invalid login attempt.': 'Sai tên đăng nhập hoặc mật khẩu.',
      'Email already exists.': 'Email này đã được sử dụng.',
      'The FullName field is required.': 'Vui lòng nhập họ và tên.',
    'The Email field is required.': 'Vui lòng nhập email.',
    'The Email field is not a valid e-mail address.': 'Email không hợp lệ.',
    };
    return translations[message] || message;
  };

  return next(req).pipe(
    catchError(error => {
      if (error) {
        switch (error.status) {
          case 400:
            if (error.error?.errors) {
              const modelStateErrors = [];
              for (const key in error.error.errors) {
                if (error.error.errors[key]) {
                  modelStateErrors.push(...error.error.errors[key])
                }

              }
              modelStateErrors.forEach(msg =>{
                 const translated = translateError(msg);
                toast.error(translated, 4000);
              }
              );
              throw modelStateErrors.flat();
            } else {
              toast.error(error.error, error.status);
            }
            break;
          case 401:
            toast.error("Bạn không có quyền truy cập");
            break;
          case 404:
            toast.error("Không tìm thấy trang");
            break;
          case 500:
            toast.error("Lỗi máy chủ");
            break;

          default:
            toast.error("Lỗi không xác định")
            break;
        }
      }
      throw error;
    })
  )
};
