import {AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy} from '@angular/core';
import { StationService } from '../../core/service/station-service';
import { DecimalPipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import * as L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-routing-machine';
import { FormsModule } from '@angular/forms';

// Icon riêng cho trạm sạc
const stationIcon = L.icon({
  iconUrl: 'assets/icons/charging-points.png', //  icon riêng của bạn
  iconRetinaUrl: 'assets/icons/charging-points.png',
  iconSize: [40, 45],
  iconAnchor: [20, 45],
  popupAnchor: [0, -40],
});

// Icon riêng cho vị trí người dùng
const userIcon = L.icon({
  iconUrl: 'assets/icons/location-pin.png', // nếu bạn có icon riêng cho user
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -30],
});

@Component({
  selector: 'app-gg-map',
  standalone: true,
  imports: [NgIf, NgFor,FormsModule],
  templateUrl: './gg-map.html',
  styleUrls: ['./gg-map.css'],
})
export class GgMap implements AfterViewInit, OnDestroy {
  private routeControl: any;
  private map!: L.Map;
  public  userMarker?: L.Marker;
  private routing?: any;
  private stationLayer = L.layerGroup();
  stations: any[] = [];
  nearest: any;
  nearestDistance?: number;
  lastResponse: any;
  searchTerm: string = '';
  searchResults: any[] = [];
  searchTimeout?: any;

   private cdRef = inject(ChangeDetectorRef);


  constructor(private stationSvc: StationService) {}
  private clearRoute(): void {
  if (this.routing) {
    try {
      if ((this.routing as any)._map) {
        this.map.removeControl(this.routing);
      }
      const line = (this.routing as any)._line;
      if (line && typeof line.removeFrom === 'function') {
        line.removeFrom(this.map);
      }
    } catch {}
    this.routing = null;
  }
    this.map.eachLayer((layer: any) => {
    if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {
      this.map.removeLayer(layer);
    }
  });
}

  ngAfterViewInit(): void {
  setTimeout(() => {
    this.initMap();
  }, 100);
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

    
    // Lấy danh sách trạm sạc
    this.stationSvc.getStations().subscribe({
      next: (data: any) => {
        this.stations = data || [];
        this.addStationMarkers();
      },
      error: (err) => console.error('Lỗi tải trạm:', err),
    });

  }

private addStationMarkers(): void {
  this.stations.forEach((s) => {
    //  Ép kiểu để gắn thêm dữ liệu tuỳ chỉnh cho marker
    const marker = L.marker([s.latitude, s.longitude], { icon: stationIcon }) as any;
    marker.stationData = s; // lưu trạm sạc vào marker

    marker.addTo(this.map)
      .bindPopup(this.createStationPopup(s), { maxWidth: 250 });

    // Zoom vào khi click icon trạm
    marker.on('click', () => {
      this.map.setView([s.latitude, s.longitude], 15);
    });
  });

   if(!this.map.hasLayer(this.stationLayer)){
     this.stationLayer.addTo(this.map);
   }
    this.map.off('popupopen');
  //  Gắn sự kiện cho popup khi mở
  this.map.on('popupopen', (e: any) => {
   const source = e.popup._source as any;
  const station = source.stationData;
  const id = station.id || L.Util.stamp(station);
  if (this.userMarker) {
    const userPos = this.userMarker.getLatLng();
    this.stationSvc.getDistance(
      userPos.lat,
      userPos.lng,
      station.latitude,
      station.longitude
    ).subscribe({
      next: (dist: any) => {
        const distanceKm = typeof dist === 'number' ? dist : (dist?.distance ?? 0);
        station.distance = distanceKm;

        // Cập nhật lại nội dung popup ngay sau khi có kết quả
        e.popup.setContent(this.createStationPopup(station));
      },
      error: (err) => console.error('Lỗi tính khoảng cách:', err),
    });
  }
   
  setTimeout(() => {
    const reserveBtn = document.getElementById(`reserve-${id}`);
    const routeBtn = document.getElementById(`route-${id}`);

    if (reserveBtn && station) {
      reserveBtn.addEventListener('click', () => this.reserveStation(station));
      
    }

    if (routeBtn && station) {
      routeBtn.addEventListener('click', () => this.routeToStation(station));
     
    }
  }, 50);
});

}

  private createStationPopup(s: any): string {
   const id = s.id || L.Util.stamp(s); // tạo ID duy nhất

  return `
    <div style="font-size:14px; line-height:1.5">
      <b>${s.name}</b><br/>
       ${s.address}<br/>
       ${s.openTime} - ${s.closeTime}<br/>
       ${s.posts?.length || 0} cổng sạc<br/>
       ${s.distance?.toFixed(2)} km<br/>
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
        Đặt chỗ sạc
      </button>
      <button id="route-${id}"
              style="
                margin-top:6px;
                width:100%;
                background:#16A34A;
                color:white;
                border:none;
                padding:6px 0;
                border-radius:6px;
                cursor:pointer;
              ">
        Chỉ đường
      </button>
    </div>
  `;
}


reserveStation(station: any) {
  console.log('Đặt chỗ cho trạm:', station);
  alert(`Đã gửi yêu cầu đặt chỗ tại ${station.name}`);
  
  //  Sau này bạn có thể gọi API thực:
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
        this.findNearest(lat, lng);
      this.cdRef.detectChanges();
    });
  }

 private findNearest(lat: number, lon: number): void {
  this.stationSvc.getNearby({ lat, lon }).subscribe({
    next: (station) => {
      if (!station) {
        alert('Không tìm thấy trạm sạc gần nhất');
        return;
      }

      this.nearest = station;
      this.nearestDistance = station?.distance ?? 0;
      this.stations = [station];
        this.clearRoute();
        this.clearStationMarkers();
        this.addStationMarkers();
        this.cdRef.detectChanges();
    },
    error: (err) => console.error('Lỗi tải trạm gần nhất', err),
  });
}
   private clearStationMarkers(){
    this.stationLayer.clearLayers();
   }

  routeToNearest(): void {

    if (!this.nearest || !this.userMarker) {
      alert('Cần có vị trí hiện tại và trạm gần nhất.');
      return;
    }
    
    this.clearRoute();
    const userPos = this.userMarker.getLatLng();
    const target = L.latLng(this.nearest.latitude, this.nearest.longitude);
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

routeToStation(station: any) {
  if (!this.userMarker) {
    alert('Bật vị trí của bạn trước khi chỉ đường.');
    return;
  }
  this.clearRoute();

  const userLatLng = this.userMarker.getLatLng();
  const stationLatLng = L.latLng(station.latitude, station.longitude);
  // Vẽ tuyến mới
  this.routeControl = L.Routing.control({
  waypoints: [userLatLng, stationLatLng],
  addWaypoints: false,
  routeWhileDragging: false,
  createMarker: () => null,
  show: false,
  lineOptions: {
    styles: [ { color: '#007BFF', opacity: 0.9, weight: 6 },  
      { color: 'white', opacity: 0.8, weight: 2 },]
  },
  router: L.Routing.osrmv1({
    serviceUrl: 'https://router.project-osrm.org/route/v1'
  }),
}).addTo(this.map);

// Ẩn phần hướng dẫn
(this.routeControl as any)._container.style.display = 'none';
}



onSearchChange(): void {
  clearTimeout(this.searchTimeout);
  this.searchTimeout = setTimeout(() => {
    const term = this.searchTerm.trim();
    if (term.length >= 2) {
      this.stationSvc.searchStations(term).subscribe({
        next : (data: any[]) => {
          this.searchResults = data;
          this.showSearchResults();
          this.cdRef.detectChanges();
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
  let temp = L.marker([s.latitude, s.longitude], { icon: stationIcon })
    .addTo(this.searchLayer)
    .bindPopup(this.createStationPopup(s), { maxWidth: 250 })
    .openPopup();
  this.searchResults = [];
  this.searchTerm = '';
}



private searchLayer = L.layerGroup();
private showSearchResults(): void {
  this.searchLayer.clearLayers();
  // xóa marker cũ nếu có
  this.searchResults.forEach(s => {
    L.marker([s.latitude, s.longitude], { icon: stationIcon })
      .addTo(this.searchLayer)
      .bindPopup(this.createStationPopup(s), { maxWidth: 250 });
  });
  if(!this.map.hasLayer(this.searchLayer)){
    this.searchLayer.addTo(this.map);
  }
  const first = this.searchResults[0];
  if(first) this.map.setView([first.latitude,first.longitude],14);
}

private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  return this.stationSvc.getDistance(lat1, lon1, lat2, lon2);
}




  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }
}
