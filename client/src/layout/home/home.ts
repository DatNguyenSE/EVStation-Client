import { Component, inject, signal } from '@angular/core';
import { SlideCarouselComponent } from "../slide-carousel/slide-carousel";
import { AccountService } from '../../core/service/account-service';
import { News } from '../more-information/news/news';
import { Instruction } from '../more-information/instruction/instruction';
import { Contact } from '../more-information/contact/contact';
import { CommonModule } from '@angular/common';
import { Dashboard } from "../../features/dashboard/dashboard";



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SlideCarouselComponent, News, Instruction, Contact, CommonModule, Dashboard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  protected registerMode = signal(false);
  userService = inject(AccountService);

  showRegister(value: boolean) {
    this.registerMode.set(value);
  }

   activeTab: string = 'news';

  changeTab(tab: string) {
    this.activeTab = tab;
  }

}
