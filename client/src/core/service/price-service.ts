import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Pricing } from '../../_models/station';

@Injectable({
  providedIn: 'root'
})
export class PriceService {
  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:5001/api';

  getPricing(){
    return this.http.get<Pricing[]>(`${this.baseUrl}/pricing`);  
  }

  updatePricing(id:number, pricing : Partial<Pricing>){
    return this.http.put<Pricing[]>(`${this.baseUrl}/pricing/${id}`,pricing);
  }
  deletePricing(id:number){
    return this.http.delete<void>(`${this.baseUrl}/pricing/${id}`)
  }
}
