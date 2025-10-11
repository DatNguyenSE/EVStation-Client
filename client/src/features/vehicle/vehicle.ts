import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverService } from '../../core/service/driver-service';

@Component({
  selector: 'app-vehicle',
  standalone: true,  
  imports: [CommonModule],
  templateUrl: './vehicle.html',
  styleUrl: './vehicle.css'
})
export class Vehicle implements OnInit {
  driverService = inject(DriverService);

  ngOnInit(): void {
    this.GetVehicles(); 
  }

  GetVehicles() {
    this.driverService.GetVehicles().subscribe({
      next: vehicles => {
        this.driverService.Vehicles.set(vehicles);
        console.log('Vehicles:', vehicles); 
      },
      error: err => {
        console.error(' Lỗi khi lấy vehicles:', err);
      }
    });
  }
}
