import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../core/service/user-service';
import { AccountService } from '../../core/service/account-service';
import { Driver, User } from '../../_models/user';
import { CommonModule } from '@angular/common';
import { Vehicle } from "../vehicle/vehicle";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, Vehicle],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  userService = inject(UserService);
  
  ngOnInit(): void {
    this.GetProfile_Driver();
  }

  GetProfile_Driver(){
    this.userService.GetProfile_Driver().subscribe({
      next: driver => {
        this.userService.currentDriver.set(driver);
      }   
    })
  }
  
}

