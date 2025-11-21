import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ReceiptService } from '../../../core/service/receipt-service';
import { ReceiptFilterParams, ReceiptSummaryDto } from '../../../_models/receipt';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { clearHttpCache } from '../../../core/interceptors/loading-interceptor';
import { FormsModule } from '@angular/forms';
import { StationService } from '../../../core/service/station-service';

@Component({
  selector: 'app-receipt',
  imports: [CommonModule, RouterModule,FormsModule ],
  templateUrl: './receipt.html',
  styleUrl: './receipt.css',
})
export class ReceiptAdmin implements OnInit {
  private receiptService = inject(ReceiptService);
  private stationService = inject(StationService);
  private cdr = inject(ChangeDetectorRef); 
  private router = inject(Router);
  private route = inject(ActivatedRoute);   

  receipts: ReceiptSummaryDto[] = [];
  stations: any[] = [];

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalItems = 0;
  isLoading = false;

  filter: ReceiptFilterParams = {
    stationId: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    appUserName: undefined,
  };

  ngOnInit() {
    this.loadReceipts();
    this.loadStations();

    // reload khi có query param ?refresh=...
    this.route.queryParams.subscribe((params) => {
      if (params['refresh']) {
        console.log('🔁 Reload triggered via query param');
        clearHttpCache(); // xoá cache cũ
        this.loadReceipts(this.currentPage);
      }
    });
  }

  loadStations() {
    this.stationService.getStations().subscribe({
      next: (res) => {
         this.stations = res; 
      },
      error: (err) => console.error('Lỗi tải trạm:', err)
    });
  }

  loadReceipts(page = 1) {
    this.isLoading = true;
    this.receiptService.getAdminReceipts(page, this.pageSize, this.filter).subscribe({
      next: (res) => {
        this.receipts = res.items;
        this.currentPage = res.pageNumber;
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

  applyFilter() {
    clearHttpCache();
    this.loadReceipts(1);
  }

  resetFilter() {
  this.filter = {
    stationId: undefined,
    status: undefined,
    startDate: undefined,
    endDate: undefined,
    appUserName: undefined, // nhớ để undefined
  };
  clearHttpCache();
  this.loadReceipts(1);
}

  prevPage() {
    if (this.currentPage > 1) this.loadReceipts(this.currentPage - 1);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.loadReceipts(this.currentPage + 1);
  }
}
