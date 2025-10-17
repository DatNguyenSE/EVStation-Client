import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DtoStation, Post } from '../../_models/station';
import { Observable } from 'rxjs';

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
  private baseUrl = 'https://localhost:5001/api';

  getStations() {
    return this.http.get<Station[]>(`${this.baseUrl}/station`);
  }

  getStationByid(idStaion: string) {
    return this.http.get<DtoStation>(this.baseUrl+"/station/"+idStaion);
  }

  searchStations(address: string) {
    return this.http.get<Station[]>(`${this.baseUrl}/station/search?address=${encodeURIComponent(address)}`);
  }

  getPostById(idPost: string){
    return this.http.get<Post>(this.baseUrl+"/posts/"+idPost);
  }
  validateScan(postId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/charging/validate-scan?postId=${postId}`, {
      observe: 'response' 
    });
  }
}
