import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GgMap } from "../gg-map/gg-map";
import { RegisterVehicle } from "../register-vehicle/register-vehicle";
import { Packages } from "../packages/packages";
import { QrCodeComponent } from "../qr-code/qr-code";
import { SessionDetail } from '../session-detail/session-detail';

@Component({
  selector: 'app-service-list',
  standalone:true,
  imports: [CommonModule, GgMap, RegisterVehicle, Packages, QrCodeComponent],
  templateUrl: './service-list.html',
  styleUrl: './service-list.css'
})
export class ServiceList {
 activeTab: string = '';
selectedPackage: any;

}
