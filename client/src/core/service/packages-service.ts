import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MyPackage, Package } from '../../_models/package';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class PackagesService {

  private http = inject(HttpClient); // Dùng inject() thay vì constructor
  private baseUrl = 'https://localhost:5001/api';

  // Lấy danh sách package
  getPackages(): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.baseUrl}/charging-package/available`)
      
  }

  purchargePackages(id:number) : Observable<{message : string}>{
    return this.http.post<{message : string}>(`${this.baseUrl}/charging-package/purchase/${id}`,{});
  }

  getMyPackage() : Observable<MyPackage[]>{
    return this.http.get<MyPackage[]>(`${this.baseUrl}/userpackage/my-packages`)
  }

  cancelPackage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/userpackage/${id}`);
  }
}
