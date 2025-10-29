import { ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { DriverService } from '../../core/service/driver-service';
import { CommonModule } from '@angular/common';
import { Vehicle } from "../../features/vehicle/vehicle";
import { GgMap } from "../../features/gg-map/gg-map";
import { PackagesService } from '../../core/service/packages-service';
import { MyPackage } from '../../_models/package';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Vehicle, GgMap],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  driverService = inject(DriverService);
  packageSvc = inject(PackagesService);
  driverPackage : MyPackage[] = []
  cdf = inject(ChangeDetectorRef)
  ngOnInit(): void {
    this.driverService.loadDriverProfile();
    this.loadDriverPackage();
  }
  loadDriverPackage(){
    this.packageSvc.getMyPackage().subscribe({
      next : (res) =>{
         this.driverPackage = res;
         console.log('Gói cước của tài xế:', this.driverPackage);
         this.cdf.detectChanges();
      },
      error :(err) =>{
        console.log("Lỗi Load Package",err);
      }
    })
  }
  getRemainingDays(endDate: Date): number {
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  
}

