import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Revenues, RevenuesPack } from '../../_models/revenue';

@Injectable({
  providedIn: 'root'
})
export class RevenueService {
   private http = inject(HttpClient);
   private baseUrl = 'https://localhost:5001/api';

  //  loadRevenue(startDate:string,endDate:string,granularity:string = 'Month',stationId?: number | null) : Observable<Revenues[]>{
  //   const noCache = Date.now();
  //   return this.http.get<Revenues[]>(`${this.baseUrl}/revenue?startDate=${startDate}&endDate=${endDate}&granularity=${granularity}&noCache=${noCache}`);
  //  }
   loadRevenue(
  startDate: string,
  endDate: string,
  granularity: string = 'Month',
  stationId?: number | null
): Observable<Revenues[]> {

  let params = new HttpParams()
    .set('startDate', startDate)
    .set('endDate', endDate)
    .set('granularity', granularity)
    .set('noCache', Date.now());

  // ⭐⭐ Sửa đoạn này — ép kiểu và đảm bảo stationId hợp lệ
  if (stationId !== null && stationId !== undefined && stationId !== 0) {
    params = params.set('stationId', stationId.toString());
  }

  return this.http.get<Revenues[]>(`${this.baseUrl}/revenue`, { params });
}

    loadPackageRevenue(startDate: string, endDate: string): Observable<RevenuesPack> {
      const noCache = Date.now();
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('noCache', noCache);

    return this.http.get<RevenuesPack>(`${this.baseUrl}/revenue/packages`, { params });
  }
}
