import { Component, inject, OnInit, signal } from '@angular/core';
import { DriverService } from '../../../core/service/driver-service';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Driver } from '../../../_models/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './profile-details.html',
  styleUrl: './profile-details.css'
})
export class ProfileDetails implements OnInit {
  private route = inject(ActivatedRoute);
  protected driver = signal<Driver | undefined>(undefined);

  ngOnInit(): void {
   this.route.parent?.data.subscribe(data => {
      this.driver.set(data['driver'])
   })
  }
}