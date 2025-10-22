import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../core/service/reservation-service';
import { StationService } from '../../core/service/station-service';
import { Vehicles } from '../../_models/user';
import { VehicleService } from '../../core/service/vehicle-service';
import { DriverService } from '../../core/service/driver-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservation',
  imports: [CommonModule,FormsModule],
  templateUrl: './reservation.html',
  styleUrl: './reservation.css'
})
export class Reservation {

  private router = inject(Router);
  private route = inject(ActivatedRoute);
   private reservationSvc = inject(ReservationService);
   private cdf = inject(ChangeDetectorRef)
  private stationSvc = inject(StationService);
  private vehicleSvc = inject(DriverService)

  station : any;
  vehicleid? : number;
  vehicles : Vehicles[] = [];
  compatiblePosts: any[] = [];
  selectedPostId?: number;
  selectedSlotObj?: { startTime: string; maxConsecutiveSlots: number };


  timeSlotStart = new Date().toISOString().slice(0, 16); // format datetime-local
  slotCount = 1;
  availableSlotsMap: Record<string, { startTime: string; maxConsecutiveSlots: number }[]> = {};
  availableDates: string[] = [];
  selectedDate?: string;
  selectedSlot?: string;


  message = '';
  loading = false;

ngOnInit() {
  this.route.queryParams.subscribe(params => {
    this.station = {
      id: +params['stationId'],
      name: params['stationName'] || ''
    };

    if (!this.station.id) {
      alert('Không tìm thấy thông tin trạm sạc');
      return;
    }

    // Load danh sách xe
    this.vehicleSvc.GetVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
        this.cdf.detectChanges();
      },
          error: () => alert('Không lấy được danh sách xe')
    });
  });
}




  loadVehicle(){
    this.vehicleSvc.GetVehicles().subscribe({
      next : (data) =>{
        this.vehicles = data;
         this.cdf.detectChanges(); 
      }
    });
  }
  //lấy danh sách post tương thích
onVehicleChange() {
    this.compatiblePosts = [];
    this.selectedPostId = undefined;
    this.availableSlotsMap = {};
    this.availableDates = [];

    if (!this.station.id || !this.vehicleid) return;
  
    this.reservationSvc.getCompatiblePosts(this.station.id, this.vehicleid).subscribe({
      next: (posts) => {
        this.compatiblePosts = posts || [];
        this.cdf.detectChanges();
      },
      error: (err) => console.error('Lỗi lấy post', err)

 
      
    });
  }
  // check slot
   onPostChange() {
  this.availableSlotsMap = {};
  this.availableDates = [];
  this.selectedSlot = undefined;

  if (!this.selectedPostId) return;

  this.reservationSvc.checkAvailableSlots(this.selectedPostId).subscribe({
    next: (result: Record<string, { startTime: string; maxConsecutiveSlots: number }[]>) => {
      this.availableSlotsMap = result || {};
      this.availableDates = Object.keys(result);

      if (this.availableDates.length) {
        this.selectedDate = this.availableDates[0]; // mặc định chọn ngày đầu tiên (thường là hôm nay)
      }

      this.cdf.detectChanges();
    },
    error: (err) => console.error('Lỗi lấy slot:', err)
  });
}
  // count slot
  onSelectSlot(slot: { startTime: string; maxConsecutiveSlots: number }) {
  this.selectedSlotObj = slot;
  this.selectedSlot = slot.startTime;
  this.slotCount = 1; // reset lại 1 khi đổi slot
}


  // dat cho
reserve() {
  if (!this.vehicleid || !this.selectedPostId || !this.selectedSlot) {
    this.message = 'Vui lòng chọn xe, trụ và thời gian.';
    return;
  }

  const req = {
    vehicleId: this.vehicleid,
    chargingPostId: this.selectedPostId,
    timeSlotStart: this.selectedSlot,  // ✅ Dùng trực tiếp, KHÔNG ghép chuỗi
    slotCount: this.slotCount
  };
//   const req = {
//   vehicleId: Number(this.vehicleid),
//   chargingPostId: Number(this.selectedPostId),
//   timeSlotStart: this.selectedSlot,
//   slotCount: this.slotCount
// };




  this.loading = true;
  this.reservationSvc.createReservationChecked(req).subscribe({
    next: () => {
      this.loading = false;
      this.message = `Đặt chỗ thành công tại ${this.station?.name}`;
      this.cdf.detectChanges();
      setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      
    },
    
    error: (err) => {
      this.loading = false;
      this.message = err.message || 'Không thể đặt chỗ.';
      this.cdf.detectChanges();
    }
  });
}









}
