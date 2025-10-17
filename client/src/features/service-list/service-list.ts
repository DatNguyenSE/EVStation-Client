import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GgMap } from "../gg-map/gg-map";
import { RegisterVehicle } from "../register-vehicle/register-vehicle";
import { Packages } from "../packages/packages";
import { QrCodeComponent } from "../qr-code/qr-code";

@Component({
  selector: 'app-service-list',
  standalone:true,
  imports: [CommonModule, GgMap, RegisterVehicle, Packages, QrCodeComponent],
  templateUrl: './service-list.html',
  styleUrl: './service-list.css'
})
export class ServiceList {
 activeTab: string = '';

  history = [
    { date: '01/10/2025', time: '14:32', station: 'Trụ A01', kwh: 12.5, price: 45000 },
    { date: '25/09/2025', time: '09:10', station: 'Trụ B05', kwh: 8.2, price: 30000 },
    { date: '20/09/2025', time: '19:05', station: 'Trụ C12', kwh: 15.7, price: 56000 },
    { date: '01/10/2025', time: '14:32', station: 'Trụ A01', kwh: 12.5, price: 45000 },
    { date: '25/09/2025', time: '09:10', station: 'Trụ B05', kwh: 8.2, price: 30000 },
    { date: '20/09/2025', time: '19:05', station: 'Trụ C12', kwh: 15.7, price: 56000 }
  ]
selectedPackage: any;

}
