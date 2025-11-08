import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MyPackage, Package } from '../../_models/package';

@Injectable({
  providedIn: 'root'
})
export class PackagesService {

  private http = inject(HttpClient);
  private baseUrl = 'https://localhost:5001/api';

  // Lấy danh sách package
  getPackages(): Observable<Package[]> {
    const noCache = new Date().getTime();
    return this.http.get<Package[]>(`${this.baseUrl}/charging-package/available?noCache=${noCache}`);
      
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

  updatePackage(id:number, pack : Partial<Package>){
      return this.http.put<Package>(`${this.baseUrl}/charging-package/${id}`,pack);
  }

  deletePackage(id:number){
      return this.http.delete<void>(`${this.baseUrl}/charging-package/${id}`);
  }

  createPackage(packages : Partial<Package>){
    return this.http.post<Package>(`${this.baseUrl}/charging-package`,packages);
  }
}
