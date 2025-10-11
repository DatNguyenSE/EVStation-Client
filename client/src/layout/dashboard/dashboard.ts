import { Component, inject, OnInit, signal } from '@angular/core';
import { DriverService } from '../../core/service/driver-service';
import { CommonModule } from '@angular/common';
import { Vehicle } from "../../features/vehicle/vehicle";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Vehicle],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  driverService = inject(DriverService);
  
  ngOnInit(): void {
    this.GetProfile_Driver();
  }

  GetProfile_Driver(){
    this.driverService.GetProfile_Driver().subscribe({
      next: driver => {
        this.driverService.currentDriver.set(driver);
      }   
    })
  }
  
}

