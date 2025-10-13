import { NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-slide-carousel',
  standalone: true,
  imports: [NgFor],
  templateUrl: './slide-carousel.html',
  styleUrl: './slide-carousel.css'
  })
export class SlideCarouselComponent implements OnInit {
  currentIndex = 0;

  slides = [
    {
      image: 'assets/slide1.png',
      title: 'MẠNG LƯỚI SẠC ĐIỆN THÔNG MINH PHỦ KHẮP VIỆT NAM',
      subtitle: 'Chúng tôi tiên phong xây dựng hệ sinh thái sạc điện xanh, thông minh và tiện lợi với hơn 600 điểm sạc toàn quốc.'
    },
    {
      image: 'assets/slide2.png',
      title: 'TIỆN LỢI VÀ HIỆU QUẢ',
      subtitle: 'Dễ dàng tìm kiếm trạm sạc và quản lý qua ứng dụng di động.'
    },
    {
      image: 'assets/slide3.png',
      title: 'HƯỚNG TỚI TƯƠNG LAI XANH',
      subtitle: 'Đồng hành cùng bạn trong hành trình chuyển đổi năng lượng sạch.'
    }
  ];

  intervalId: any;

  ngOnInit() {
    this.startAutoSlide();
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => this.next(), 5000);
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goTo(index: number) {
    this.currentIndex = index;
  }
}
