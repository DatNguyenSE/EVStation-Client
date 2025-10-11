import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../core/service/user-service';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../core/service/account-service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  userService = inject(UserService);

  ngOnInit(): void {
    this.profile();
  }

  profile() {
    this.userService.GetProfile_Driver().subscribe({
      next: dirver => {
        this.userService.currentDriver.set(dirver);
      }  
    })
  }
}
