import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { PackagesService } from '../../core/service/packages-service';
import { Package } from '../../_models/payment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../core/service/toast-service';
import { Router } from '@angular/router';
import { DriverService } from '../../core/service/driver-service';

@Component({
  selector: 'app-packages',
  imports: [CommonModule,FormsModule],
  templateUrl: './packages.html',
  styleUrl: './packages.css'
})

export class Packages {
    package : Package[]=[];
    selectedPackageId: number | null = null;
    private packageservice = inject(PackagesService);
    private driverSvc = inject(DriverService)
    private cdRef = inject(ChangeDetectorRef);
    private router = inject(Router);
    message: string = '';
    isLoading = false;

   showConfirmModal: boolean = false;
   packageToBuy: Package | null = null;
   toast = inject(ToastService);



    
    ngOnInit(){
          this.getPackages();
          this.driverSvc.loadWallet();
          this.cdRef.detectChanges();
    }
    getPackages(){
      this.packageservice.getPackages().subscribe({
        next : (data) =>{
          this.package=data;
          this.cdRef.detectChanges();
        }
      })
    }
     selectPackage(packageId : number) {
     if(this.selectedPackageId === packageId){
       this.selectedPackageId = null;
     }else{
         this.selectedPackageId= packageId;
     }
     this.packageToBuy = this.package.find(p => p.id === packageId) || null;
  }
  openConfirmModal(pkg: Package) {
    this.packageToBuy = pkg;
    this.showConfirmModal = true;
  }
  closeModal() {
    this.showConfirmModal = false;
    this.packageToBuy = null;
  }


  confirmPurchase() {
    if (!this.packageToBuy) return;
    this.isLoading = true;
    // this.message = '';

    this.packageservice.purchargePackages(this.packageToBuy.id).subscribe({
      next: (res) => {
        // this.message =  res.message;
        this.isLoading = false;
        setTimeout(() =>{
          this.toast.success(res.message);
          // this.router.navigate(['/']);
        })
        this.showConfirmModal = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        this.message = err.error?.message || 'Mua gói thất bại.';
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });
  }
}
