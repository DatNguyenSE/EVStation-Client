import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { 
  PaginatedResult, 
  ReceiptDto,          // Dùng cho danh sách
  ReceiptDetailsDto,   // Dùng cho chi tiết
  PagingParams,
  ReceiptSummaryDto 
} from '../../_models/receipt';
import { ReceiptService } from '../../core/service/receipt-service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './receipt.html',
  styleUrls: ['./receipt.css'],
})
export class Receipt implements OnInit {
  private receiptService = inject(ReceiptService);
  private cdr = inject(ChangeDetectorRef); 

  receipts: ReceiptSummaryDto[] = [];
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  totalItems = 0;
  isLoading = false;

  ngOnInit() {
    this.loadReceipts();
  }

  loadReceipts(page: number = 1) {
    this.isLoading = true;
    this.receiptService.getUserReceipts(page, this.pageSize).subscribe({
      next: (res) => {
        console.log('📄 API:', res);
        this.receipts = res.items;
        this.currentPage = res.pageNumber;
        this.pageSize = res.pageSize;
        this.totalPages = res.pageCount;
        this.totalItems = res.totalItemCount;
        this.isLoading = false;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadReceipts(this.currentPage);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      console.log('👉 nextPage clicked, currentPage:', this.currentPage);
      this.currentPage++;
      console.log('👉 nextPage new page:', this.currentPage);
      this.loadReceipts(this.currentPage);
    }
  }
}
