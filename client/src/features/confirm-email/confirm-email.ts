import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EmailServices } from '../../core/service/email-services';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './confirm-email.html',
  styleUrls: ['./confirm-email.css'],
})
export class ConfirmEmail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private emailService = inject(EmailServices);
  private cdr = inject(ChangeDetectorRef)

  
  message = '';
  isSuccess = false;
  loading = true;

  ngOnInit(): void {
    const snapshot = this.route.snapshot;
    if (!snapshot) {
      this.message = 'Lỗi hệ thống khi đọc đường dẫn xác nhận.';
      this.loading = false;
      return;
    }

    const userId = snapshot.queryParamMap.get('userId');
    const token = snapshot.queryParamMap.get('token');
    if (userId && token) {
      this.emailService.confirmEmail(userId, token).subscribe({
        next: (res: { message: string }) => {
          this.message = res.message;
          this.isSuccess = true;
          this.loading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/dang-nhap']), 100000);
        },
        error: (err: HttpErrorResponse) => {
          this.message = 'Xác nhận email thất bại.';
          this.isSuccess = false;
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    } 
    else {
      this.message = 'Liên kết không hợp lệ hoặc đã hết hạn.';
      this.loading = false;
      this.isSuccess = false;
    }
  }
}
