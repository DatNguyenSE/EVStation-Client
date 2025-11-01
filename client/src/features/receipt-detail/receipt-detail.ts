import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ReceiptDetailsDto } from '../../_models/receipt';
import { ActivatedRoute, Router } from '@angular/router';
import { ReceiptService } from '../../core/service/receipt-service';

@Component({
  selector: 'app-receipt-detail',
  imports: [CommonModule],
  templateUrl: './receipt-detail.html',
  styleUrl: './receipt-detail.css',
})
export class ReceiptDetail implements OnInit {
  receipt?: ReceiptDetailsDto;
  isLoading = true;
  errorMessage = '';
  private cdr = inject(ChangeDetectorRef); 
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private receiptService: ReceiptService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (isNaN(id)) {
      this.errorMessage = 'Mã biên lai không hợp lệ.';
      this.isLoading = false;
      return;
    }

    this.receiptService.getReceiptById(id).subscribe({
      next: (res) => {
        this.receipt = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Không thể tải chi tiết biên lai.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/bien-lai']);
  }
}
