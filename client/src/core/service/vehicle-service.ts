import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Vehicles, VehicleResponse } from '../../_models/user';
import { catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private http = inject(HttpClient);
  private baseurl = 'https://localhost:5001/api';

  register( vehicle : Vehicles){
    return this.http.post<VehicleResponse>(`${this.baseurl}/vehicle/add`, vehicle).pipe(

      map(vehicle =>{
        if(vehicle){
          localStorage.setItem("vehicle",JSON.stringify(vehicle));
        }
        return vehicle;
      }),
      catchError(err =>{
        return throwError(() => err);
      })
    )
  }
  
}
