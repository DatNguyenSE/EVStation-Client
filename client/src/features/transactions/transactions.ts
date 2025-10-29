import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { TransactionService } from '../../core/service/transaction-service';
import { TransactionDto } from '../../_models/payment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule,FormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css'
})
export class Transactions {
   private transactionSvc = inject(TransactionService);
   private cdf = inject(ChangeDetectorRef);
   transaction? : TransactionDto[] = [];
   message = '';
   
   ngOnInit(){
    this.getTransaction();
   }

   getTransaction(){
    this.transactionSvc.getTransaction().subscribe({
      next : (data) =>{
        console.log('Transaction API ',data);
        this.transaction = data;
        this.cdf.detectChanges();
      },
      error : (err) =>{
        this.message = err.message;
      }
    })
   }

}
