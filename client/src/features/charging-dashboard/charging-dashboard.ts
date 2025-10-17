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
  postID!: string;
  route = inject(ActivatedRoute)
  stationService = inject(StationService);
  currentPost = signal<Post | null>(null);
  currentStation = signal<DtoStation | null> (null);
  router = inject(Router)
errorMessage = signal<string | null>(null);

validateScan() {
  this.stationService.validateScan(this.postID).subscribe({
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
        console.error('⚠️ Lỗi khác:', err);
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
    this.postID = this.route.snapshot.paramMap.get('id')!;
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
    this.stationService.getPostById(this.postID).pipe(
      tap(post => this.currentPost.set(post)),
      switchMap(post => this.stationService.getStationByid(post.stationId)),
      tap(DtoStation => this.currentStation.set(DtoStation))
    ).subscribe({
      next: () => console.log('Đã load post + station'),
      error: err => console.error(err)
    })

  }
}
