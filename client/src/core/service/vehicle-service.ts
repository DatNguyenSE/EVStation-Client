import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Vehicles, VehicleResponse, VehicleModelDetail, VehiclePending } from '../../_models/vehicle';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private http = inject(HttpClient);
  private baseurl = 'https://localhost:5001/api';

  /**
   * Đăng ký một phương tiện mới.
   * @param vehicle Dữ liệu phương tiện cần đăng ký.
   */
  register(formData: FormData): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(`${this.baseurl}/vehicle/add`, formData).pipe(
      map(response => {
        console.log("API",response);
        // Tinh chỉnh: Đổi tên biến `vehicle` thành `response` để tránh nhầm lẫn
        // với tham số `vehicle` đầu vào của hàm.
        if (response) {
          // Tinh chỉnh: Đổi key trong localStorage để rõ ràng hơn rằng đây là
          // kết quả trả về từ API, không phải dữ liệu gửi đi.
          // localStorage.setItem("vehicle_response", JSON.stringify(response));
        }
        return response; // Trả về response gốc cho component xử lý.
      }),
      catchError(err => {
        // Thêm console.error để dễ dàng debug trong console của trình duyệt.
        console.error('Error during vehicle registration:', err);
        return throwError(() => err); // Ném lỗi ra để component có thể bắt và xử lý.
      })
    );
  }

  /**
   * Lấy danh sách các mẫu xe dựa trên loại xe.
   * @param vehicleType Loại xe (ví dụ: 0 cho Motorbike, 1 cho Car).
   */
  getVehicleModels(vehicleType: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseurl}/vehicle/models?vehicleType=${vehicleType}`).pipe(
      catchError(err => {
        console.error('Error fetching vehicle models:', err);
        return throwError(() => err);
      })
    );
  }

  getVehicleModelDetails(modelName: string): Observable<VehicleModelDetail> {
    const encodedModelName = encodeURIComponent(modelName);
    return this.http.get<VehicleModelDetail>(`${this.baseurl}/vehiclemodels/details?modelName=${encodedModelName}`).pipe(
      catchError(err => {
        console.error('Error fetching vehicle model details:', err);
        return throwError(() => err);
      })
    );
  }

  getVehiclePending(){
    const noCache = new Date().getTime();

    return this.http.get<VehiclePending[]>(`${this.baseurl}/vehicle/pending?noCache=${noCache}`);
  }

  approveVehicle(vehicleId: number): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.baseurl}/vehicle/${vehicleId}/approve`, {});
  }

  rejectVehicle(vehicleId: number): Observable<{message: string}> {
    return this.http.post<{message: string}>(`${this.baseurl}/vehicle/${vehicleId}/reject`, {});
  }
}