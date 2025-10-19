import { Component, inject, OnInit, signal } from '@angular/core';
import { DriverService } from '../../core/service/driver-service';
import { DriverBalance } from '../../_models/user';
import { Nav } from '../../layout/nav/nav';

@Component({
  selector: 'app-payment',
  standalone:true,
  imports: [],
  templateUrl: './payment.html',
  styleUrl: './payment.css'
})
export class Payment implements OnInit{
  driverService = inject(DriverService);

  ngOnInit(): void {
    this.driverService.walletBalance();
  }

  
}