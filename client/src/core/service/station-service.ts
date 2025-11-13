import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DtoStation, Post } from '../../_models/station';
import { map, Observable } from 'rxjs';

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
    return this.http.get<DtoStation[]>(`${this.baseUrl}/station`,{
    params: { noCache: Date.now().toString() }  // ép gọi mới mỗi lần
  });
  }

  getStationByid(idStaion: number) {
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
  getNearby(location: { lat: number; lon: number}, count: number = 5) {
    return this.http.get<DtoStation[]>(`${this.baseUrl}/station/nearest?lat=${location.lat}&lon=${location.lon}&count=${count}`);
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
  addStation(station : Partial<DtoStation>){
     return this.http.post<DtoStation>(`${this.baseUrl}/station`,station);
  }
  updateStation(id:number,station :Partial<DtoStation>){
    return this.http.put<DtoStation>(`${this.baseUrl}/station/${id}`,station);
  }
  deleteStation(id:number){
    return this.http.delete<void>(`${this.baseUrl}/station/${id}`);
  }
  
updateStationStatus(id: number, status: number) {
  return this.http.put(`${this.baseUrl}/station/${id}/status`, status); 
}

getPostsByStationId(id: number): Observable<Post[]> {
  const noCache = new Date().getTime(); // timestamp để URL luôn khác
  return this.http.get<DtoStation>(`${this.baseUrl}/station/${id}?_=${noCache}`).pipe(
    map(station => station.chargingPosts || [])
  );
}










}
