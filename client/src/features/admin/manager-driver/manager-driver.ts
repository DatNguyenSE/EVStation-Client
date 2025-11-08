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
   isLoadingDriver = false;
   isLoadingVehicle = false;

   

  ngOnInit(){
    this.loadDriver();
    this.loadPendingVehicle();
  }
  OpenImage(url : string){
     console.log('URL ảnh được click:', url);
    this.selectedImageUrl=url;
  }
  CloseImage(){
    this.selectedImageUrl =null;
  }

  loadDriver(){
     this.isLoadingDriver = true;
    this.driverSvc.getAllDriver().subscribe({
      next : (res) =>{
        this.drivers = res;
        this.isLoadingDriver = false;
        this.cdf.detectChanges();
      },
      error : (err) =>{
        this.toast.error(`Lỗi Load Tài Xế`)
      }
    })
  }

banUser(userId: string) {
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
            const driver = this.drivers.find((d:Driver) => d.id === userId);
            if (driver) {driver.isBanned = true
              driver.lockoutEnd = res.lockoutEnd; 
            };
            
            setTimeout(() => this.loadDriver(), 500);
            this.cdf.detectChanges();
        },
      }) 
    }
  })
}
 unBanDriver(userId : string){
  Swal.fire({
    title:'Bạn Có Chắc Unban Tài Xế Này Không',
    icon:'warning',
    showCancelButton:true,
    confirmButtonText:'Xác Nhận',
  }).then((result) =>{
    if(result.isConfirmed){
      this.driverSvc.unBanDriver(userId).subscribe({
        next : (res : any) =>{
          this.toast.success(res.message);
          const driver = this.drivers.find((d:Driver) => d.id === userId);
          if(driver) {driver.isBanned = false
            driver.lockoutEnd = null;
          }
          setTimeout(() => this.loadDriver(), 500);
            this.cdf.detectChanges();
        }
      })
    }
  })
 }


  loadPendingVehicle(){
      this.isLoadingVehicle = true;
      this.vehicleSvc.getVehiclePending().subscribe({
        next :(res) =>{
          this.vehiclePending = res;
          this.isLoadingVehicle = false;
          this.cdf.detectChanges();
        },
        error : (err) =>{
          this.toast.error(`Lỗi Load Danh sách xe `);
        }
      })
  }
  approveVehicle(vehicleId : number){
     this.isLoadingVehicle = true;
     this.vehicleSvc.approveVehicle(vehicleId).subscribe({
        next : (res) =>{
          this.toast.success(res.message);
          this.vehiclePending= this.vehiclePending.filter(v => v.vehicleId !== vehicleId);
          this.isLoadingVehicle= false;
          this.cdf.detectChanges();
        }
     })
  }
   rejectVehicle(vehicleId : number){
       Swal.fire({
        title:'Bạn Có Chắc Không Duyệt Xe Này Không',
        icon:'warning',
        showCancelButton:true,
        confirmButtonText:'Xác Nhận',
       }).then((result) =>{
        if(result.isConfirmed){
             this.isLoadingVehicle = true;
     this.vehicleSvc.rejectVehicle(vehicleId).subscribe({
        next : (res) =>{
          this.toast.success(res.message);
          this.vehiclePending = this.vehiclePending.filter(v => v.vehicleId !== vehicleId);
          this.isLoadingVehicle= false;
          this.cdf.detectChanges();
        }
       })
        }
       })
  }


}
