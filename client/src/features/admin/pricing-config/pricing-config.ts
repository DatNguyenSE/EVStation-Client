import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Pricing } from '../../../_models/station';
import { PriceService } from '../../../core/service/price-service';
import { ToastService } from '../../../core/service/toast-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PackagesService } from '../../../core/service/packages-service';
import { Package } from '../../../_models/package';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pricing-config',
  imports: [CommonModule,FormsModule],
  templateUrl: './pricing-config.html',
  styleUrl: './pricing-config.css',
})
export class PricingConfig {
  private priceSvc = inject(PriceService);
  private toast = inject(ToastService);
  private cdf = inject(ChangeDetectorRef);
  private packageSvc = inject(PackagesService);
    //load bang gia
    price : Pricing[] =[];
    editPrice : Pricing | null = null;
    //load packages
    packages : Package[]=[];
    editPackage: Package | null = null;
    newPackage: Partial<Package> = {
      name: '',
      description: '',
      vehicleType: '',
      price: 0,
      durationDays: 0,
      isActive: true, 
    };



    ngOnInit(){
      this.loadPrice();
      this.getPackages();
    }

     loadPrice(){
    this.priceSvc.getPricing().subscribe({
      next :(res) =>{
        this.price = res;
        this.cdf.detectChanges();
      },
      error :(err) =>{
        this.toast.error(`Lỗi Tải Bảng Giá`)
      }
    })
  }
   editPrices(price: Pricing) {
      this.editPrice = { ...price }; // sao chép dữ liệu ra để chỉnh sửa
    }

    isTimeBased(priceType: string | undefined): boolean {
      return priceType === 'OccupancyFee' || priceType === 'OverstayFee';
    }

  // updatePrice
  updatePrice(){
    if(!this.editPrice) return;

    if (!this.editPrice.id) {
      this.toast.error('Không thể cập nhật vì thiếu ID!');
      return;
    }

    if (this.isTimeBased(this.editPrice.priceType)) {
        this.editPrice.pricePerKwh = 0; 
        // Dữ liệu lấy từ ô input sẽ vào editPrice.pricePerMinute
    } else {
        (this.editPrice.pricePerMinute as any) = null;
        // Dữ liệu lấy từ ô input sẽ vào editPrice.pricePerKwh
    }

    this.priceSvc.updatePricing(this.editPrice.id,this.editPrice).subscribe({
      next : (res) =>{
        const index = this.price.findIndex(d => d.id === this.editPrice!.id);
        if(index !== -1){
          this.price[index] = {
            ...this.editPrice,
            ...res};
        }
        this.toast.success(`Đã cập nhật thành công bảng giá`);
        
        this.editPrice = null;
        this.cdf.detectChanges();
      },
      error: (err) => {
          // Nên thêm hiển thị lỗi để biết tại sao backend từ chối
          this.toast.error(err.error || 'Có lỗi xảy ra khi cập nhật');
      }
    })
  }
  cancelEdit(){
    this.editPrice = null
  }

  // load package
   getPackages(){
      this.packageSvc.getPackages().subscribe({
        next : (data) =>{
          console.log("API",data);
          this.packages=data;
          this.cdf.detectChanges();
        }
      })
    }

    createPackage(){

      if (
    !this.newPackage.name ||
    !this.newPackage.description ||
    !this.newPackage.vehicleType ||
    (this.newPackage.price ?? 0) <= 0 ||
    (this.newPackage.durationDays ?? 0) <= 0
  ) {
    this.toast.warning('Vui lòng điền đầy đủ thông tin trước khi tạo gói!');
    return; // Dừng không gọi API
  }

       const payLoad = {
          name : this.newPackage.name,
          description : this.newPackage.description,
          vehicleType : this.newPackage.vehicleType,
          price : this.newPackage.price,
          durationDays : this.newPackage.durationDays,
          isActive : this.newPackage.isActive

       }
       this.packageSvc.createPackage(payLoad).subscribe({
         next : (res : any) =>{
            this.toast.success('Tạo Thêm Gói Mới Thành Công');
            this.packages.push(res);
            this.newPackage = { name: '', description: '', vehicleType: '', price: 0, durationDays: 0, isActive: true };
            this.cdf.detectChanges()
         },
          error: (err) => {
            this.toast.error('Vui lòng nhập đầy đủ thông tin');
          }
       })
    }

    editPackages(pack : Package){
         this.editPackage = {...pack};
    }

    updatePackages(){
      if(!this.editPackage) return;
      this.packageSvc.updatePackage(this.editPackage.id,this.editPackage).subscribe({
         next : (res)  =>{
          const index = this.packages.findIndex(d => d.id === this.editPackage!.id);
          if(index !== -1){
            this.packages[index] = {
              ...this.editPackage,
              ... res
            }
            this.toast.success(`Đã cập nhật thành công Gói`);
            this.cdf.detectChanges();
            this.editPackage = null;
          }
         }
      })
    }
    cancelEditPackages(){
      this.editPackage=null;
    }

    deletePackages(id:number){
       Swal.fire({
        title : 'Bạn Có Chắc Có Muốn Xóa Gói Này Không',
        icon:'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy'
       }).then((result)=>{
        if(result.isConfirmed){
          this.packageSvc.deletePackage(id).subscribe({
            next :(res) =>{
              this.toast.success(`Đã Xóa Gói Thành Công`);
              this.packages = this.packages.filter(pkg => pkg.id !== id);
              this.cdf.detectChanges();
            }
          })
        }
       })
    }


}
