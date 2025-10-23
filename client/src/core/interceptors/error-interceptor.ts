import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs';
import { ToastService } from '../service/toast-service';
import { Router } from '@angular/router';


export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const router = inject(Router);

  const translateError = (message: string): string => {
    const translations: Record<string, string> = {
      // Trường bắt buộc
      'The Password field is required.': 'Vui lòng nhập mật khẩu.',
      'The Username field is required.': 'Vui lòng nhập tên đăng nhập.',
      'The FullName field is required.': 'Vui lòng nhập họ và tên.',
      'The Email field is required.': 'Vui lòng nhập email.',

      //  Email
      'The Email field is not a valid e-mail address.': 'Email không hợp lệ.',
      'Email already exists.': 'Email này đã được sử dụng.',


      // Password rules (ASP.NET Identity)
      'Passwords must be at least 12 characters.': 'Mật khẩu phải có ít nhất 12 ký tự.',
      'Passwords must have at least one non alphanumeric character.': 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt.',
      "Passwords must have at least one lowercase ('a'-'z').": 'Mật khẩu phải chứa ít nhất 1 chữ thường.',
      "Passwords must have at least one uppercase ('A'-'Z').": 'Mật khẩu phải chứa ít nhất 1 chữ hoa.',
      "Passwords must have at least one digit ('0'-'9').": 'Mật khẩu phải chứ ít nhất 1 chữ số'
    };

    // Trả về bản dịch nếu có, ngược lại giữ nguyên
    return translations[message] || message;
  };


  return next(req).pipe(
    catchError(error => {
      if (error) {
        switch (error.status) {
          case 400:
            console.log(' Full error object:', error);
            console.log(' Error detail:', error.error);

            if (Array.isArray(error.error) && error.error.length > 0) {
              // ASP.NET Identity errors
              error.error.forEach((e: any) => {
                const translated = translateError(e.description);
                toast.error(translated, 4000);
              });
            }

            else if (error.error?.errors) {
              // ModelState errors
              for (const key in error.error.errors) {
                error.error.errors[key].forEach((msg: string) => {
                  const translated = translateError(msg);
                  toast.error(translated, 4000);
                });
              }
            }
            else if(error.error.message){
              toast.error(error.error.message);
            }

            else if (typeof error.error === 'string') {
              toast.error(translateError(error.error), 4000);
            }
            else if (error.error.message){
              toast.error(translateError(error.error.message),4000)
            }

            else {
              toast.error('Lỗi không xác định', 4000);
            }


            break;

          case 401:
            toast.error(error.error,3500);
            toast.error("Bạn không có quyền truy cập",3500);
            break;
          case 404:
            toast.error("Không tìm thấy trang");
            break;
          case 500:
            toast.error("Lỗi máy chủ");
            break;

          default:
           
            break;
        }
      }
      throw error;
    })
  )
};
