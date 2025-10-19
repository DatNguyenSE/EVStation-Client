import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DtoStation, Post } from '../../_models/station';
import { StationService } from '../../core/service/station-service';
import { switchMap, tap } from 'rxjs';
@Component({
  selector: 'app-charging-dashboard',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './charging-dashboard.html',
  styleUrl: './charging-dashboard.css'
})
export class ChargingDashboard implements OnInit, OnDestroy {
  idPost!: string;
  route = inject(ActivatedRoute)
  stationService = inject(StationService);
  currentPost = signal<Post | null>(null);
  currentStation = signal<DtoStation | null> (null);
  router = inject(Router)
  errorMessage = signal<string | null>(null);

validateScan() {
  this.stationService.validateScan(this.idPost).subscribe({
    next: response => {
      if (response.status === 200) {
        console.log(' Validate thành công', response.body);
        this.errorMessage.set(null); // clear lỗi nếu có
      }
    },
    error: err => {
      if (err.status === 409) {
        console.error('Validate lỗi:', err.error?.message);
        this.errorMessage.set(err.error?.message || 'Có lỗi xảy ra');
      } else {
        console.error(' Lỗi khác:', err);
        this.errorMessage.set('Không thể kết nối đến server');
      }
    }
  });
}
  // Dữ liệu sạc động
  pricePerKwh = 4000; // VNĐ
  chargedKwh = 0;
  totalPrice = 0;
  batteryPercent = 20;
  chargingInterval: any;
  timeElapsed = 0; // giây

  ngOnInit() {
    this.startChargingSimulation();
    this.idPost = this.route.snapshot.paramMap.get('idPost')!;
    this.getPostById();
    this.validateScan();
  }

  startChargingSimulation() {
    this.chargingInterval = setInterval(() => {
      this.timeElapsed += 5; // 5 giây mỗi tick
      this.chargedKwh += 0.05; // giả lập tăng dần
      this.totalPrice = this.chargedKwh * this.pricePerKwh;
      this.batteryPercent = Math.min(100, this.batteryPercent + 0.5);
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.chargingInterval);
  }

  getPostById() {
    console.log('🟢 Gửi validate với postId:', this.idPost); // 👉 in ra xem có đúng là "11" không
  this.stationService.getPostById(this.idPost).pipe(
    tap(post => {
      console.log(' Nhận được post:', post);
      this.currentPost.set(post);
    }),

    switchMap(post => {
      console.log('Gọi stationId:', post.stationId);
      return this.stationService.getStationByid(post.stationId);
    }),
    tap(station => {
      console.log(' Nhận được station:', station);
      this.currentStation.set(station);
    })
  ).subscribe({
    next: () => console.log('Đã load post + station'),
    error: err => {
      console.error(' Lỗi khi load post/station:', err);
      console.error(' idPost:', this.idPost);
    }
  });
}
}
