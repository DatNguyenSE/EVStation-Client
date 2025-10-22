import { Component, inject, OnInit, signal } from '@angular/core';
import { DriverService } from '../../../core/service/driver-service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Driver } from '../../../_models/user';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  driverService = inject(DriverService);
  protected driver = signal<Driver | undefined>(undefined);
  protected route = inject(ActivatedRoute);
  protected router = inject(Router);
  ngOnInit(): void {

    this.route.data.subscribe({
      next: data => this.driver.set(data['driver'])
    });

  
  }

  







  // profile() {
  //   this.driverService.GetProfile_Driver().subscribe({
  //     next: driver => {
  //       this.driverService.currentDriver.set(driver);
  //     }  
  //   });

  //   this.driverService.GetVehicles().subscribe({
  //     next : vehicle =>{
  //       this.driverService.Vehicles.set(vehicle);
  //     }
  //   })
  // }
}
