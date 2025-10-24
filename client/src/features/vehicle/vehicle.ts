import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverService } from '../../core/service/driver-service';
import { Vehicles } from '../../_models/user';

@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle.html',
  styleUrl: './vehicle.css'
})
export class Vehicle implements OnInit {
  driverService = inject(DriverService);
  Vehicles = signal<Vehicles[]>([])
  ngOnInit(): void {
    this.GetVehicles();
  }

  GetVehicles() {
    this.driverService.GetVehicles().subscribe({
      next: vehicles => {
        this.Vehicles.set(vehicles);
      },
      error: err => {
        console.error(' Lỗi khi lấy vehicles:', err);
      }
    });
  }


  currentVehicleIndex = signal<number>(0);

  nextVehicle() {
  const vehicles = this.Vehicles();
  if (!vehicles || vehicles.length === 0) return;
  if (this.currentVehicleIndex() < vehicles.length - 1) {
    this.currentVehicleIndex.set(this.currentVehicleIndex() + 1);
  }
  }

  previousVehicle() {
    if (this.currentVehicleIndex() > 0) {
      this.currentVehicleIndex.set(this.currentVehicleIndex() - 1);
    }
  }

  setCurrentVehicle(index: number) {
    this.currentVehicleIndex.set(index);
  }
}
