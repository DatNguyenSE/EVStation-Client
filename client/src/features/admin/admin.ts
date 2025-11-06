import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AccountService } from '../../core/service/account-service';
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { DriverService } from '../../core/service/driver-service';
import { PackagesService } from '../../core/service/packages-service';
import { StationService } from '../../core/service/station-service';
import { Driver } from '../../_models/user';
import { ToastService } from '../../core/service/toast-service';
import { DtoStation, Post, Pricing } from '../../_models/station';
import { Package } from '../../_models/package';
import { PostService } from '../../core/service/post-service';
import { Vehicle } from '../vehicle/vehicle';
import { PriceService } from '../../core/service/price-service';

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  protected accountService = inject(AccountService);
  private driverSvc = inject(DriverService);
  private packageSvc = inject(PackagesService);
  private postSvc = inject(PostService);
  private stationSvc = inject(StationService);
  private priceSvc = inject(PriceService);
  private toast = inject(ToastService);
  private cdf = inject(ChangeDetectorRef);

  // dành cho driver
  drivers : Driver[] = [];
  activeDriverCount: number = 0;
  banDriverCount: number = 0;
  
  // dành cho staion
  stations : DtoStation[] =[];
  activeStationCount : number =0;
  inactiveStationCount : number =0;
  maintenanceStationCount : number =0;

  // dành cho post
  posts : Post[] =[];
  activePostCount : number =0;
  offlinePostCount : number =0;
  maintenancePostCount : number =0;


  // dành cho package
  packages : Package[]=[];
  packagesCount : number = 0;

  // dành cho vehicle 
  vehicle : Vehicle[] =[];
  vehiclePending:number =0;
  vehicleApprove:number=0;
  vehicleReject:number=0;
  
  //load bang gia
  price : Pricing[] =[];
  editPrice : Pricing | null = null


  isRootAdminPage = true;

  ngOnInit(){
  this.loadDriver();
  this.loadStation();
  this.loadPost();
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

  // updatePrice
  updatePrice(id:number){
    if(!this.editPrice) return;
    this.priceSvc.updatePricing(this.editPrice.id,this.editPrice).subscribe({
      next : (res) =>{
        this.price = res;
        this.cdf.detectChanges();

      }
    })
  }

  loadDriver(){
    this.driverSvc.getAllDriver().subscribe({
      next : (res) =>{
        console.log('Dữ liệu từ API:', res);
        this.drivers = res;
        this.activeDriverCount = this.drivers.filter((d : Driver) => d.isBanned === false).length
        this.banDriverCount = this.drivers.filter((d : Driver) => d.isBanned === true).length
        this.cdf.detectChanges();
      },
      error : (err) =>{
        this.toast.error(`Lỗi Load Tài Xế`)
      }
    })
  }
   // staion
   loadStation() {
  this.stationSvc.getStations().subscribe({
    next: (res) => {
       this.stations = res;
       this.activeStationCount = this.stations.filter((d:DtoStation) => d.status === 'Active').length;
       this.inactiveStationCount = this.stations.filter((d:DtoStation) => d.status === 'Inactive').length;
       this.maintenanceStationCount = this.stations.filter((d:DtoStation) => d.status === 'Maintenance').length;
      this.cdf.detectChanges();
    },
    error: (err) => {
      this.toast.error(`Lỗi Load Trạm `)
    },
  });
}

// post
loadPost(){
  this.postSvc.getAllPost().subscribe({
    next : (res) =>{
      this.posts = res;
      this.activePostCount = this.posts.filter((d:Post) => d.status === 'Available').length;
      this.offlinePostCount = this.posts.filter((d:Post) => d.status === 'Offline').length;
      this.maintenancePostCount = this.posts.filter((d:Post) => d.status === 'Maintenance').length;
      this.cdf.detectChanges();
    },
    error: (err) => {
      this.toast.error(`Lỗi Load Trụ `)
    }
  })
}
//package
   getPackages(){
      this.packageSvc.getPackages().subscribe({
        next : (data) =>{
          this.packages=data;
          this.packagesCount = this.packages.length;
          this.cdf.detectChanges();
        }
      })
    }
  
}


