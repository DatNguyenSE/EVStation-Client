import { Component, inject, signal } from '@angular/core';
import { Register } from '../account/register/register.component';
import { SlideCarouselComponent } from "../../layout/slide-carousel/slide-carousel";
import { RenterDashboardComponent } from "../../shared/renter-dashboard/renter-dashboard";
import { AccountService } from '../../core/service/account-service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Register, SlideCarouselComponent, RenterDashboardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class Home {
  protected registerMode = signal(false);
  account = inject(AccountService);
  currentUser = this.account.currentUser;

  showRegister(value: boolean) {
    this.registerMode.set(value);
  }
 
}
