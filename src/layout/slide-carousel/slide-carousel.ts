import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-slide-carousel',
  standalone: true,
  imports: [NgFor],
  templateUrl: './slide-carousel.html',
  styleUrl: './slide-carousel.css'
  })
export class SlideCarouselComponent {
  images = ['/assets/slide1.png', '/assets/slide2.png', '/assets/slide3.png']; // đặt trong folder assets
  currentIndex = 0;

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }
  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }
}