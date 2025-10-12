import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { StationService } from '../../core/service/station-service';
import { DecimalPipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import * as L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-routing-machine';
import { FormsModule } from '@angular/forms';

// 🧩 Icon riêng cho trạm sạc
const stationIcon = L.icon({
  iconUrl: 'assets/icons/charging-points.png', // ✅ icon riêng của bạn
  iconRetinaUrl: 'assets/icons/charging-points.png',
  iconSize: [40, 45],
  iconAnchor: [20, 45],
  popupAnchor: [0, -40],
});

// 🧩 Icon riêng cho vị trí người dùng
const userIcon = L.icon({
  iconUrl: 'assets/icons/location-pin.png', // nếu bạn có icon riêng cho user
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -30],
});

@Component({
  selector: 'app-gg-map',
  standalone: true,
  imports: [NgIf, NgFor, JsonPipe,FormsModule],
  templateUrl: './gg-map.html',
  styleUrls: ['./gg-map.css'],
})
export class GgMap implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private userMarker?: L.Marker;
  private routing?: any;
  stations: any[] = [];
  nearest: any;
  nearestDistance?: number;
  lastResponse: any;

  constructor(private stationSvc: StationService) {}

  ngAfterViewInit(): void {
    // // ✅ Bảo đảm DOM sẵn sàng
    // const mapEl = document.getElementById('map');
    // if (!mapEl) return;

    // // ✅ Quan sát khi phần tử map thật sự hiển thị => mới khởi tạo (ổn định hơn setTimeout)
    // const observer = new IntersectionObserver((entries) => {
    //   const entry = entries[0];
    //   if (entry.isIntersecting) {
    //     this.initMap();
    //     observer.disconnect();
    //   }
    // });
    // observer.observe(mapEl);
    this.initMap();
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [10.776, 106.7],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    // ép map vẽ lại khi hiển thị lần đầu
    setTimeout(() => this.map.invalidateSize(), 300);
     this.map.on('focus', () => this.map.scrollWheelZoom.enable());
    this.map.on('blur', () => this.map.scrollWheelZoom.disable());
    
    

    // ✅ Lấy danh sách trạm sạc
    this.stationSvc.getStations().subscribe({
      next: (data: any) => {
        this.stations = data || [];
        this.addStationMarkers();
      },
      error: (err) => console.error('Lỗi tải trạm:', err),
    });

 
    this.stationSvc.getStations().subscribe({
      next:(data :any) =>{
        this.stations = data || [];
        this.addStationMarkers();
      }
    })
  }

private addStationMarkers(): void {
  this.stations.forEach((s) => {
    // 👇 Ép kiểu để gắn thêm dữ liệu tuỳ chỉnh cho marker
    const marker = L.marker([s.latitude, s.longitude], { icon: stationIcon }) as any;
    marker.stationData = s; // ✅ lưu trạm sạc vào marker

    marker.addTo(this.map)
      .bindPopup(this.createStationPopup(s), { maxWidth: 250 });

    // 👇 Zoom vào khi click icon trạm
    marker.on('click', () => {
      this.map.setView([s.latitude, s.longitude], 15);
    });
  });

  // 👇 Gắn sự kiện cho popup khi mở
  this.map.on('popupopen', (e: any) => {
    const source = e.popup._source as any; // marker nguồn mở popup
    const station = source.stationData; // ✅ lấy dữ liệu trạm sạc
    const btn = document.getElementById(`reserve-${source._leaflet_id}`);

    if (btn && station) {
      btn.addEventListener('click', () => this.reserveStation(station));
    }
  });
}

  private createStationPopup(s: any): string {
  const id = L.Util.stamp(s); // tạo ID duy nhất
  return `
    <div style="font-size:14px; line-height:1.5">
      <b>${s.name}</b><br/>
      📍 ${s.address}<br/>
      ⏰ ${s.openTime} - ${s.closeTime}<br/>
      ⚡ ${s.posts?.length || 0} cổng sạc<br/>
      <button id="reserve-${id}" 
              style="
                margin-top:8px; 
                width:100%; 
                background:#2563EB; 
                color:white; 
                border:none; 
                padding:6px 0; 
                border-radius:6px; 
                cursor:pointer;
              ">
        🔋 Đặt chỗ sạc
      </button>
    </div>
  `;
}
reserveStation(station: any) {
  console.log('Đặt chỗ cho trạm:', station);
  alert(`✅ Đã gửi yêu cầu đặt chỗ tại ${station.name}`);

  // 👉 Sau này bạn có thể gọi API thực:
  // this.stationSvc.reserveStation(station.id).subscribe(...)
}


  locateMe(): void {
    if (!navigator.geolocation) {
      alert('Trình duyệt không hỗ trợ định vị.');
      return;
    }

    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      if (this.userMarker) this.userMarker.remove();

      this.userMarker = L.marker([lat, lng], { icon: userIcon })
        .addTo(this.map);

      this.map.setView([lat, lng], 14);

      this.stationSvc.sendLocation({ lat, lng }).subscribe((res) => {
        this.lastResponse = res;
      });

      this.findNearest(lat, lng);
    });
  }

  private findNearest(lat: number, lng: number): void {
    if (this.stations.length === 0) return;

    const R = 6371;
    const toRad = (x: number) => (x * Math.PI) / 180;
    const dist = (aLat: number, aLng: number, bLat: number, bLng: number) => {
      const dLat = toRad(bLat - aLat);
      const dLng = toRad(bLng - aLng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(aLat)) *
          Math.cos(toRad(bLat)) *
          Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(a));
    };

    let min = Infinity;
    let nearest: any = null;

    this.stations.forEach((s) => {
      const d = dist(lat, lng, s.latitude, s.longitude);
      if (d < min) {
        min = d;
        nearest = s;
      }
    });

    this.nearest = nearest;
    this.nearestDistance = min;
  }

  routeToNearest(): void {
    if (!this.nearest || !this.userMarker) {
      alert('Cần có vị trí hiện tại và trạm gần nhất.');
      return;
    }

    const userPos = this.userMarker.getLatLng();
    const target = L.latLng(this.nearest.latitude, this.nearest.longitude);

    if (this.routing) this.routing.remove();

    this.routing = L.Routing.control({
      waypoints: [userPos, target],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
      }),
      addWaypoints: false,
      routeWhileDragging: false,
      show: false,
      createMarker:() => null,
       lineOptions: {
    styles: [
      { color: '#007BFF', opacity: 0.9, weight: 6 },  // nét chính
      { color: 'white', opacity: 0.8, weight: 2 },   // viền sáng giữa (tùy chọn)
    ],
  },
    }).addTo(this.map);
  }

  searchTerm: string = '';
searchResults: any[] = [];
searchTimeout?: any;

onSearchChange(): void {
  clearTimeout(this.searchTimeout);
  this.searchTimeout = setTimeout(() => {
    const term = this.searchTerm.trim();
    if (term.length >= 2) {
      this.stationSvc.searchStations(term).subscribe({
        next : (data: any[]) => {
          this.searchResults = data;
          this.showSearchResults();
        },
        error: (err) => console.error('Search lỗi:', err)
      });
    }
  }, 400); // debounce 0.4s
}
focusStation(s: any) {
  // Zoom tới trạm
  this.map.setView([s.latitude, s.longitude], 15);

  // Mở popup của trạm (nếu có marker)
  const marker = L.marker([s.latitude, s.longitude]);
  marker.bindPopup(this.createStationPopup(s)).openPopup();
  this.searchResults = [];
  this.searchTerm = '';
}




private showSearchResults(): void {
  // xóa marker cũ nếu có
  this.searchResults.forEach(s => {
    const marker = L.marker([s.latitude, s.longitude], { icon: stationIcon })
      .addTo(this.map)
      .bindPopup(this.createStationPopup(s), { maxWidth: 250 })
      .openPopup();
    this.map.setView([s.latitude, s.longitude], 14);
  });
}


  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }
}
