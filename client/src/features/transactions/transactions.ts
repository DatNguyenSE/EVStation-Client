import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { PagedResult, PaginationMeta, TransactionService } from '../../core/service/transaction-service';
import { TransactionDto } from '../../_models/payment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.html',
  styleUrls: ['./transactions.css']
})
export class Transactions implements OnInit {
  transactions: TransactionDto[] = [];

  meta: PaginationMeta = {
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalCount: 0
  };

  isLoading = false;
  errorMessage = '';
  private transactionService = inject(TransactionService);
  private cdr = inject(ChangeDetectorRef);

  pageNumber = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(page: number = this.pageNumber): void {
    this.isLoading = true;

    this.transactionService.getTransactions(page, this.pageSize).subscribe({
      next: (res: PagedResult<TransactionDto>) => {
        // Cập nhật state bên trong setTimeout để tránh ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
          this.transactions =res.items || []
          if (res.pagination) {
            this.meta = res.pagination;
            this.pageNumber = res.pagination.currentPage;
          }
          
          this.isLoading = false;
          this.cdr.detectChanges(); // đảm bảo view update ngay
        });
      },
      error: (err) => {
        console.error(err);
        setTimeout(() => {
          this.errorMessage = 'Không thể tải giao dịch.';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  prevPage(): void {
    if (this.pageNumber > 1) this.loadTransactions(this.pageNumber - 1);
  }

  nextPage(): void {
    if (this.pageNumber < this.meta.totalPages) this.loadTransactions(this.pageNumber + 1);
  }

  get hasMultiplePages(): boolean {
    return this.meta.totalPages > 1;
  }
}
