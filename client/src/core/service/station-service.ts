import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DtoStation, Post } from '../../_models/station';
import { Observable } from 'rxjs';

// export interface Station {
//   id: number;
//   name: string;
//   latitude: number;
//   longitude: number;
//   distance: number;
//   post:number;
// }

@Injectable({
  providedIn: 'root'
})
export class StationService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:5001/api';

  getStations() {
    return this.http.get<DtoStation[]>(`${this.baseUrl}/station`);
  }

  getStationByid(idStaion: string) {
    return this.http.get<DtoStation>(this.baseUrl+"/station/"+idStaion);
  }
  // getPost(id:number){
  //    return this.http.get<DtoStation[]>(this.baseUrl + "/posts/" + id);
  // }

  searchStations(address: string) {
    return this.http.get<DtoStation[]>(`${this.baseUrl}/station/search?address=${encodeURIComponent(address)}`);
  }

  getPostById(postId: string) {
    return this.http.get<Post>(`${this.baseUrl}/posts/${postId}`);
  }

  validateScan(postId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/charging/validate-scan?postId=${postId}`, {
      observe: 'response'
    });
  }
  getNearby(location: { lat: number; lon: number }) {
    return this.http.get<DtoStation>(`${this.baseUrl}/station/nearest?lat=${location.lat}&lon=${location.lon}`);
  }
  getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    return this.http.get<{ distance: number }>(`${this.baseUrl}/station/distance`, {
      params: {
        lat1: lat1.toString(),
        lon1: lon1.toString(),
        lat2: lat2.toString(),
        lon2: lon2.toString(),
      },

    });
  }




}
