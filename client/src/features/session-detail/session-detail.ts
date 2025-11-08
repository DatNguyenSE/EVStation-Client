import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChargingSessionService } from '../../core/service/charging-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-session-detail',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './session-detail.html',
  styleUrl: './session-detail.css',
})
export class SessionDetail implements OnInit{
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private chargingService = inject(ChargingSessionService);
  private cdr = inject(ChangeDetectorRef); 

  session: any;
  isLoading = true;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      Swal.fire('Lỗi', 'Không tìm thấy ID phiên sạc', 'error');
      this.router.navigate(['/']);
      return;
    }

    this.chargingService.getSessionDetail(id).subscribe({
      next: (res) => {
        this.session = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Lỗi', 'Không thể tải chi tiết phiên sạc', 'error');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}
