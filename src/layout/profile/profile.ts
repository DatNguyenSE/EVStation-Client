import { Component, inject } from '@angular/core';
import { UserService } from '../../core/service/user-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  userService = inject(UserService);
  
}
