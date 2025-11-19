import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AccountService } from '../../core/service/account-service'; // Sửa đường dẫn import cho đúng file của bạn
import { ToastService } from '../../core/service/toast-service';

@Component({
  selector: 'app-guest-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './guest-register.html',
})
export class GuestRegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  registerForm: FormGroup = new FormGroup({});
  plateFromUrl = signal<string>('');
  isSubmitting = signal(false);
  validationErrors = signal<string[]>([]);

  ngOnInit(): void {
    // 1. Lấy biển số xe từ URL query params (?plate=...)
    this.route.queryParams.subscribe(params => {
      this.plateFromUrl.set(params['plate'] || '');
      
      // Cập nhật giá trị vào form nếu đã khởi tạo
      if (this.registerForm.controls['guestVehicleLicensePlate']) {
        this.registerForm.patchValue({ guestVehicleLicensePlate: this.plateFromUrl() });
      }
    });

    this.initializeForm();

    this.registerForm.get('username')?.valueChanges.subscribe(() => {
      if (this.registerForm.get('username')?.hasError('userTaken')) {
        this.registerForm.get('username')?.setErrors(null); // Xóa lỗi
        // Nếu có validator required thì nó sẽ tự check lại required, yên tâm
      }
    });

    this.registerForm.get('email')?.valueChanges.subscribe(() => {
      if (this.registerForm.get('email')?.hasError('emailTaken')) {
        this.registerForm.get('email')?.setErrors(null);
      }
    });
  }

  initializeForm() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(12), // Dài ít nhất 12
        // Regex: Ít nhất 1 chữ hoa, 1 số, 1 ký tự đặc biệt
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/) 
      ]],
      fullName: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      // Trường này ẩn, tự động điền
      guestVehicleLicensePlate: [this.plateFromUrl(), [Validators.required]] 
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched(); 
      return;
    }

    this.isSubmitting.set(true);
    this.validationErrors.set([]);

    // Gọi API register-and-sync-guest
    this.accountService.registerAndSyncGuest(this.registerForm.value).subscribe({
      next: (response) => {
        this.toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
        // Chuyển hướng về trang login hoặc trang chủ
        this.router.navigate(['dang-nhap']); 
      },
      error: (err) => {
        this.isSubmitting.set(false);
        
        // --- XỬ LÝ LỖI TRÙNG LẶP ---
        const errorMsg = typeof err.error === 'string' ? err.error : '';
        
        // 1. Nếu lỗi liên quan đến Username
        if (errorMsg.includes('Tên đăng nhập')) {
          // Gán lỗi thủ công vào ô username
          this.registerForm.get('username')?.setErrors({ userTaken: true });
        } 
        // 2. Nếu lỗi liên quan đến Email
        else if (errorMsg.includes('Email')) {
          // Gán lỗi thủ công vào ô email
          this.registerForm.get('email')?.setErrors({ emailTaken: true });
        } 
        // 3. Các lỗi khác (Identity Error list hoặc lỗi server)
        else {
          // Xử lý nếu BE trả về mảng lỗi (Identity Errors)
          if (Array.isArray(err.error)) {
            // Duyệt qua mảng lỗi để gán vào từng ô nếu có thể
            err.error.forEach((e: any) => {
              if (e.code === 'DuplicateUserName') {
                  this.registerForm.get('username')?.setErrors({ userTaken: true });
              }
              else if (e.code === 'DuplicateEmail') {
                  this.registerForm.get('email')?.setErrors({ emailTaken: true });
              } else {
                  // Lỗi không xác định thì hiện lên đầu trang
                  this.validationErrors.update(v => [...v, e.description]);
              }
            });
          } else {
            // Lỗi string khác thì hiện lên đầu trang
            this.validationErrors.set([errorMsg || 'Đăng ký thất bại']);
          }
        }
      }
    });
  }
}