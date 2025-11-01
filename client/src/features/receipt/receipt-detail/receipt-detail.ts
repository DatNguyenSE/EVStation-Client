import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ReceiptDetailsDto } from '../../../_models/receipt';
import { ActivatedRoute, Router } from '@angular/router';
import { ReceiptService } from '../../../core/service/receipt-service';

@Component({
  selector: 'app-receipt-detail',
  imports: [CommonModule],
  templateUrl: './receipt-detail.html',
  styleUrl: './receipt-detail.css',
})
export class ReceiptDetail implements OnInit {
  receipt: ReceiptDetailsDto = {
    id: 0,
    createAt: new Date().toISOString(),
    status: 'Pending',
    appUserId: undefined,
    appUserName: undefined,
    packageId: undefined,
    packageName: undefined,
    energyConsumed: 0,
    energyCost: 0,
    idleStartTime: undefined,
    idleEndTime: undefined,
    idleFee: 0,
    overstayFee: 0,
    discountAmount: 0,
    totalCost: 0,
    pricingName: '',
    pricePerKwhSnapshot: 0,
    paymentMethod: undefined,
    confirmedByStaffId: undefined,
    confirmedByStaffName: undefined,
    confirmedAt: undefined,
    chargingSessions: [],
    walletTransactions: []
  };
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
