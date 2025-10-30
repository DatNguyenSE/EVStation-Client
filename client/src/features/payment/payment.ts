import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { DriverService } from '../../core/service/driver-service';
import { PaymentService } from '../../core/service/payment-service';
import { Payments } from '../../_models/payment';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CurrencyFormatDirective } from '../../core/_directive/currency-format';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-payment',
  standalone:true,
  imports: [FormsModule,CommonModule,CurrencyFormatDirective],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class Payment implements OnInit{
  driverService = inject(DriverService);
  paymentScv = inject(PaymentService)
  route = inject(ActivatedRoute)
  cdf = inject(ChangeDetectorRef)
   amount: number = 0;
   message ='';
   isReturn = false;
   isSuccess = false;

   selectAmount(value: number) {
  this.amount = value;
}

  ngOnInit(): void {
    this.driverService.walletBalance();
    this.driverService.loadDriverProfile();
     const queryParams = this.route.snapshot.queryParams;
    if (queryParams['vnp_Amount']) {
      this.isReturn = true;
      this.vnpayreturn(queryParams);
    }

  }
  
  
  Topup() {
     const user = this.driverService.currentDriver;
   if(!user){
    alert ('Vui Lòng Đăng Nhập trước khi nạp tiền')
   }

   const payments : Payments ={
      orderType: 'other',
      amount: this.amount,
      orderDescription: 'Nạp tiền vào ví tài xế',
      name: user.name, 
      txnRef: Date.now().toString()
   }

   this.paymentScv.topUp(payments).subscribe({
    next : (res) =>{
      window.location.href= res.paymentUrl;
    },
    error :(err) =>{
      // this.message=err.message;
    }
   })
  }
  vnpayreturn(params : any){
      this.paymentScv.vnpayreturn(params).subscribe({
        next : async res =>{
           this.isSuccess = true;
            this.message = res.message;
          if(res.data?.success){
            await this.driverService.loadWallet();
            this.cdf.detectChanges();
            setTimeout(() =>{
              window.location.href = '/';
            },3000)

          }
        },
        error :(err) =>{
          this.message = err.message;
        }
      })
  }

  
}