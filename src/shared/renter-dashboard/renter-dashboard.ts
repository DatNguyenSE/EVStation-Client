import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { News } from "../../layout/information/news/news";
import { Instruction } from "../../layout/information/instruction/instruction";
import { Contact } from "../../layout/information/contact/contact";

@Component({
  selector: 'app-renter-dashboard',
  standalone: true,  
  imports: [CommonModule, News, Instruction, Contact,],
  templateUrl: './renter-dashboard.html',
  styleUrl: './renter-dashboard.css'
})

export class RenterDashboardComponent {
  currentVehicle = {
    id: "RNT001",
    vehicle: "Vinfast VF-5",
    owner: "Dat Nguyen",
    kmHasRun: "16.820.7 km",
    battery: 85,
    status: "active"
  };

 
  activeTab: string = 'news';

  changeTab(tab: string) {
    this.activeTab = tab;
  }
}
