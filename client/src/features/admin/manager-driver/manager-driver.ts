import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { DriverService } from '../../../core/service/driver-service';
import { VehicleService } from '../../../core/service/vehicle-service';
import { Driver } from '../../../_models/user';
import { ToastService } from '../../../core/service/toast-service';
import { VehiclePending } from '../../../_models/vehicle';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2'
@Component({
  selector: 'app-manager-driver',
  imports: [CommonModule,FormsModule],
  templateUrl: './manager-driver.html',
  styleUrl: './manager-driver.css',
})
export class ManagerDriver {
  private driverSvc = inject(DriverService);
  private vehicleSvc = inject(VehicleService);
  private toast = inject(ToastService);
  private cdf = inject(ChangeDetectorRef)
  drivers : Driver[] =[];

  vehiclePending : VehiclePending[] =[];
  selectedImageUrl: string | null =null;
   message = '';
   isLoading = false;

  ngOnInit(){
    this.loadDriver();
    this.loadPendingVehicle();
  }
  OpenImage(url : string){
    this.selectedImageUrl=url;
  }
  CloseImage(){
    this.selectedImageUrl =null;
  }

  loadDriver(){
    this.driverSvc.getAllDriver().subscribe({
      next : (res) =>{
        this.drivers = res;
        console.log('Hàm loadPendingVehicle được gọi');
        this.cdf.detectChanges();
      },
      error : (err) =>{
        this.toast.error(`Lỗi Load Tài Xế`)
      }
    })
  }

banUser(userId: string,driver:Driver) {
  Swal.fire({
      title:'Nhập Số Ngày Bạn Muốn Ban Người Này',
      input:'number',
      inputValue:'7',
      inputAttributes:{
        min : '1',
        step:'1'
      },
      showCancelButton:true,
      confirmButtonText:'Xác Nhận',
      inputValidator:(value) =>{
        if(!value || Number(value) <= 0){
          return 'Vui lòng nhập số ngày hợp lệ (>0)';
        }
        return null
      }
  }).then((result) =>{
    if(result.isConfirmed){
      const days = Number(result.value);
      this.driverSvc.banDriver(userId,days).subscribe({
        next : (res : any) =>{
            this.toast.success(res.message);
            this.loadDriver();
        },
        error : (err) =>{
          this.toast.error(err.error?.message || 'Không thể ban người dùng.');
        }
      }) 
    }
  })
}


  loadPendingVehicle(){
      this.isLoading = true;
      this.vehicleSvc.getVehiclePending().subscribe({
        next :(res) =>{
          this.vehiclePending = res;
          this.isLoading = false;
          this.cdf.detectChanges();
        },
        error : (err) =>{
          this.toast.error(`Lỗi Load Danh sách xe `);
        }
      })
  }
  approveVehicle(vehicleId : number){
     this.isLoading = true;
     this.vehicleSvc.approveVehicle(vehicleId).subscribe({
        next : (res) =>{
          this.toast.success(res.message);
          this.vehiclePending= this.vehiclePending.filter(v => v.vehicleId !== vehicleId);
          this.isLoading= false;
          this.cdf.detectChanges();
        }
     })
  }
   rejectVehicle(vehicleId : number){
       if (!confirm('Bạn có chắc muốn từ chối xe này không?')) return;
     this.isLoading = true;
     this.vehicleSvc.rejectVehicle(vehicleId).subscribe({
        next : (res) =>{
          this.toast.success(res.message);
          this.vehiclePending = this.vehiclePending.filter(v => v.vehicleId !== vehicleId);
          this.isLoading= false;
          this.cdf.detectChanges();
        }
     })
  }


}
