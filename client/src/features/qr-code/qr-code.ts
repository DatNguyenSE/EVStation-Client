import { CommonModule } from '@angular/common';
import { Component, inject, NgModule, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { Result } from '@zxing/library';
import { Dashboard } from "../../layout/dashboard/dashboard";
import { ChargingDashboard } from "../charging-dashboard/charging-dashboard";
import { Router } from '@angular/router';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './qr-code.html',
  styleUrls: ['./qr-code.css']
})
export class QrCodeComponent implements OnInit, OnDestroy {
  codeReader = new BrowserMultiFormatReader();
  videoElement!: HTMLVideoElement;
  resultText: string | null = null;
  selectedFile: File | null = null;
  stationId: string = '';
  isScanning = false;
  errorMessage: string | null = null;
  controls: IScannerControls | null = null;
  router = inject(Router)
  ngOnInit() {}

  async startScan() {
    try {
      this.isScanning = true;
      this.resultText = null;
      this.errorMessage = null;

      const videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
      const firstDeviceId = videoInputDevices[0]?.deviceId;

      if (!firstDeviceId) {
        this.errorMessage = 'Không tìm thấy camera nào.';
        this.isScanning = false;
        return;
      }

      this.videoElement = document.querySelector('#video-preview') as HTMLVideoElement;

      // Lưu controls để dừng sau
      this.controls = await this.codeReader.decodeFromVideoDevice(firstDeviceId, this.videoElement, (result, err) => {
        if (result) {
          this.resultText = result.getText();
          console.log("Thong tin: "+this.resultText)
          this.stopScan();
          this.router.navigate(['/thongtinsac',this.resultText]);
        }
      });

    } catch (error) {
      this.errorMessage = 'Không thể mở camera. Vui lòng kiểm tra quyền truy cập.';
      console.log(error)
      this.isScanning = false;
    }
  }

  stopScan() {
    this.isScanning = false;
    if (this.controls) {
      this.controls.stop(); // cách đúng để dừng camera
      this.controls = null;
    }
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedFile = file;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
      try {
        const result: Result = await this.codeReader.decodeFromImageElement(img);
        this.resultText = result.getText();
         this.router.navigate(['/thongtinsac',this.resultText]);
      } catch (err) {
        this.errorMessage = 'Không thể đọc mã QR từ ảnh.';
      }
    };
  }

  submitStationId() {
    if (!this.stationId.trim()) return;
     this.router.navigate(['/thongtinsac',this.stationId]);
  }

  ngOnDestroy() {
    this.stopScan();
  }

  
}
