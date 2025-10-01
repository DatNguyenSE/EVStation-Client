import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-renter-dashboard',
  standalone: true,  
  imports: [CommonModule,],
  templateUrl: './vehicle.html',
  styleUrl: './vehicle.css'
})

export class Vehicle {
  currentVehicle = {
    id: "RNT001",
    vehicle: "Vinfast VF-5",
    owner: "Dat Nguyen",
    kmHasRun: "16.820.7 km",
    battery: 85,
    status: "active"
  };

}
