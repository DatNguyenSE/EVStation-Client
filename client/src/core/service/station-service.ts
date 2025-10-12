import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
}


@Injectable({
  providedIn: 'root'
})
export class StationService {
   private http = inject(HttpClient);
  private baseUrl = 'https://localhost:5001/api'; // ✅ địa chỉ backend

  getStations() {
    return this.http.get<Station[]>(`${this.baseUrl}/station`);
  }

  sendLocation(location: { lat: number; lng: number }) {
    return this.http.post(`${this.baseUrl}/location`, location);
  }

  searchStations(address: string) {
    return this.http.get<Station[]>(`${this.baseUrl}/station/search?address=${encodeURIComponent(address)}`);
  }
}
