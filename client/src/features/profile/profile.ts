import { Component, inject, OnInit } from '@angular/core';
import { DriverService } from '../../core/service/driver-service';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../core/service/account-service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  driverService = inject(DriverService);

  ngOnInit(): void {
    this.profile();
  }

  profile() {
    this.driverService.GetProfile_Driver().subscribe({
      next: dirver => {
        this.driverService.currentDriver.set(dirver);
      }  
    })
  }
}
