import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DriverService } from '../../core/service/driver-service';
import { Vehicles } from '../../_models/vehicle';
import { ToastService } from '../../core/service/toast-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-vehicle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehicle.html',
  styleUrl: './vehicle.css'
})
export class Vehicle implements OnInit {
  driverService = inject(DriverService);
  Vehicles = signal<Vehicles[]>([])
  private toast = inject(ToastService);

  showUploadModal = signal(false);
  selectedVehicleIdForUpload: number | null = null;
  uploadForm: FormGroup;
  isUploading = signal(false);

  // Biến lưu file đã chọn
  selectedFrontFile: File | null = null;
  selectedBackFile: File | null = null;

  // Preview ảnh
  frontPreview: string | null = null;
  backPreview: string | null = null;

  ngOnInit(): void {
    this.GetVehicles();
  }

  GetVehicles() {
    this.driverService.GetVehicles().subscribe({
      next: vehicles => {
        this.Vehicles.set(vehicles);
      },
      error: err => {
        console.error(' Lỗi khi lấy vehicles:', err);
      }
    });
  }


  currentVehicleIndex = signal<number>(0);

  nextVehicle() {
  const vehicles = this.Vehicles();
  if (!vehicles || vehicles.length === 0) return;
  if (this.currentVehicleIndex() < vehicles.length - 1) {
    this.currentVehicleIndex.set(this.currentVehicleIndex() + 1);
  }
  }

  previousVehicle() {
    if (this.currentVehicleIndex() > 0) {
      this.currentVehicleIndex.set(this.currentVehicleIndex() - 1);
    }
  }

  setCurrentVehicle(index: number) {
    this.currentVehicleIndex.set(index);
  }

  cancelVehicle(vehicleId: number) {
    const confirmed = confirm('Bạn có chắc chắn muốn vô hiệu hóa phương tiện này không? Bạn có thể kích hoạt lại sau.');
    
    if (!confirmed) return;

    // Gọi hàm "deactivate" (vô hiệu hóa) mới
    this.driverService.deactivateVehicle(vehicleId).subscribe({
      next: (response) => {
        this.toast.success(response.message || 'Đã vô hiệu hóa phương tiện.');
        this.GetVehicles();
      },
      error: (err) => {
        console.error('Lỗi khi vô hiệu hóa phương tiện:', err);
        this.toast.error(err.error?.message || 'Vô hiệu hóa thất bại.');
      }
    });
  }
  
  getStatusStyles(status: string): { text: string; cssClass: string } {
    switch (status) {
      case 'Approved':
        return { 
          text: 'Đã xác thực', 
          cssClass: 'bg-green-500 text-white' 
        };
      case 'Pending':
        return { 
          text: 'Chờ duyệt', 
          cssClass: 'bg-yellow-500 text-white' 
        };
      case 'Rejected':
        return { 
          text: 'Bị từ chối', 
          cssClass: 'bg-red-500 text-white' 
        };
      default:
        return { 
          text: 'Không rõ', 
          cssClass: 'bg-gray-400 text-white' 
        };
    }
  }

  constructor(private fb: FormBuilder) { // Inject FormBuilder ở constructor hoặc dùng inject()
     this.uploadForm = this.fb.group({
       frontImage: [null, Validators.required],
       backImage: [null, Validators.required]
     });
  }

  // Hàm mở Modal
  openUploadModal(vehicleId: number) {
    this.selectedVehicleIdForUpload = vehicleId;
    this.showUploadModal.set(true);
    // Reset form
    this.uploadForm.reset();
    this.selectedFrontFile = null;
    this.selectedBackFile = null;
    this.frontPreview = null;
    this.backPreview = null;
  }

  closeUploadModal() {
    this.showUploadModal.set(false);
    this.selectedVehicleIdForUpload = null;
  }

  // Xử lý chọn file
  onFileSelected(event: any, type: 'front' | 'back') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (type === 'front') {
          this.selectedFrontFile = file;
          this.frontPreview = e.target.result;
          this.uploadForm.patchValue({ frontImage: file });
        } else {
          this.selectedBackFile = file;
          this.backPreview = e.target.result;
          this.uploadForm.patchValue({ backImage: file });
        }
      };
      reader.readAsDataURL(file);
    }
  }

  submitDocuments() {
    if (!this.selectedVehicleIdForUpload || !this.selectedFrontFile || !this.selectedBackFile) {
      this.toast.error('Vui lòng chọn đủ 2 ảnh cà vẹt xe.');
      return;
    }

    this.isUploading.set(true);

    const formData = new FormData();
    formData.append('VehicleId', this.selectedVehicleIdForUpload.toString());
    formData.append('RegistrationImageFront', this.selectedFrontFile);
    formData.append('RegistrationImageBack', this.selectedBackFile);

    this.driverService.updateVehicleDocs(formData).subscribe({
      next: (res: any) => {
        this.toast.success(res.message);
        this.isUploading.set(false);
        this.closeUploadModal();
        this.GetVehicles(); // Load lại danh sách để cập nhật trạng thái
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      error: (err) => {
        console.error(err);
        this.toast.error(err.error?.message || 'Lỗi khi cập nhật giấy tờ');
        this.isUploading.set(false);
      }
    });
  }
  
  // Hàm kiểm tra xem xe có cần bổ sung giấy tờ không
  // Logic: Nếu xe Pending (hoặc trạng thái khác) VÀ thiếu ảnh -> Cần bổ sung
  needsDocsUpdate(vehicle: Vehicles): boolean {
    // Logic: 
    // 1. Xe phải là trạng thái Pending hoặc Rejected (Approved rồi thì thôi)
    // 2. VÀ (&&) xe đang bị thiếu 1 trong 2 ảnh
    const isNotApproved = vehicle.registrationStatus === 'Pending' || vehicle.registrationStatus === 'Rejected';
    
    const isMissingDocs = !vehicle.vehicleRegistrationFrontUrl || !vehicle.vehicleRegistrationBackUrl;

    return isNotApproved && isMissingDocs;
  }
}
