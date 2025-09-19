import { Component, signal } from '@angular/core';
import { Nav } from "../layout/nav/nav";
import { SlideCarouselComponent } from "../layout/slide-carousel/slide-carousel";
import { RenterDashboardComponent } from "../shared/renter-dashboard/renter-dashboard";
import { Footer } from "../layout/footer/footer";

@Component({
  selector: 'app-root',
  imports: [Nav, SlideCarouselComponent, RenterDashboardComponent, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected  title = 'Trạm Sạc Xe Điện';


}
