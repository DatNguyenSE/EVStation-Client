import { Component, inject, ChangeDetectorRef, OnInit, OnDestroy, viewChild, ElementRef, ViewChild } from '@angular/core';
import { VehicleService } from '../../core/service/vehicle-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Vehicles, VehicleModelDetail } from '../../_models/vehicle'; // Đảm bảo import VehicleModelDetail

@Component({
  selector: 'app-register-vehicle',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-vehicle.html',
  styleUrl: './register-vehicle.css'
})
export class RegisterVehicle implements OnInit, OnDestroy {
  vehicleservice = inject(VehicleService);
  private fb = inject(FormBuilder);
  private cdRef = inject(ChangeDetectorRef);

  registerForm: FormGroup;
  
  vehicleTypes = [
    { display: 'Motorbike', value: 0 },
    { display: 'Car', value: 1 }
  ];
  
  vehicleModels: string[] = [];
  connectorTypes = ['Type2', 'CCS2', 'VinEScooter'];

  canHaveDualBattery = false;
  private originalBatteryCapacity = 0;
  
  message = '';
  isError = false;

  // MỚI: Thêm 2 thuộc tính để quản lý file
  selectedFile: File | null = null;
  @ViewChild('fileInput') fileInput?: ElementRef;
  
  private typeChangesSub?: Subscription;
  private modelChangesSub?: Subscription;
  private dualBatterySub?: Subscription;

  constructor() {
    this.registerForm = this.fb.group({
      type: [null, Validators.required],
      model: [{ value: '', disabled: true }, Validators.required],
      batteryCapacityKWh: [{ value: null, disabled: true }, [Validators.required, Validators.min(1)]],
      maxChargingPowerKW: [{ value: null, disabled: true }, [Validators.required, Validators.min(1)]],
      connectorType: [{ value: '', disabled: true }, Validators.required],
      useDualBattery: [false],
      plate: ['', Validators.required],
      // MỚI: Thêm form control cho file (chủ yếu để validation)
      registrationImage: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.listenToTypeChanges();
    this.listenToModelChanges();
    this.listenToDualBatteryChanges();
  }

  // MỚI: Hàm để xử lý khi người dùng chọn file
  onFileSelected(event: any): void {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (file) {
      this.selectedFile = file;
      // Cập nhật form control để validator biết là đã có file
      this.registerForm.patchValue({ registrationImage: file.name });
      this.registerForm.get('registrationImage')?.updateValueAndValidity();
    } else {
      this.selectedFile = null;
      this.registerForm.patchValue({ registrationImage: null });
      this.registerForm.get('registrationImage')?.updateValueAndValidity();
    }
  }

  private listenToTypeChanges(): void {
    this.typeChangesSub = this.registerForm.get('type')?.valueChanges.subscribe(typeValue => {
      this.canHaveDualBattery = false;
      this.registerForm.get('useDualBattery')?.setValue(false, { emitEvent: false });
      this.registerForm.get('model')?.reset({ value: '', disabled: true });
      this.registerForm.patchValue({
        batteryCapacityKWh: null,
        maxChargingPowerKW: null,
        connectorType: ''
      });
      this.vehicleModels = [];
      
      if (typeValue !== null && typeValue !== undefined) {
        this.vehicleservice.getVehicleModels(typeValue).subscribe(models => {
          this.vehicleModels = models;
          this.registerForm.get('model')?.enable();
        });
      }
    });
  }

  private listenToModelChanges(): void {
    this.modelChangesSub = this.registerForm.get('model')?.valueChanges.subscribe(modelName => {
      this.canHaveDualBattery = false;
      this.originalBatteryCapacity = 0;
      this.registerForm.get('useDualBattery')?.setValue(false, { emitEvent: false });

      if (modelName) {
        this.vehicleservice.getVehicleModelDetails(modelName).subscribe(details => {
          this.originalBatteryCapacity = details.batteryCapacityKWh;
          this.registerForm.patchValue({
            batteryCapacityKWh: details.batteryCapacityKWh,
            maxChargingPowerKW: details.maxChargingPowerKW,
            connectorType: details.connectorType
          });

          if (details.hasDualBattery) {
            this.canHaveDualBattery = true;
          }
          this.cdRef.detectChanges(); 
        });
      }
    });
  }

  private listenToDualBatteryChanges(): void {
    this.dualBatterySub = this.registerForm.get('useDualBattery')?.valueChanges.subscribe(useDual => {
      if (this.canHaveDualBattery && this.originalBatteryCapacity > 0) {
        const newCapacity = useDual ? this.originalBatteryCapacity * 2 : this.originalBatteryCapacity;
        this.registerForm.get('batteryCapacityKWh')?.setValue(newCapacity);
      }
    });
  }

  // SỬA: Viết lại hoàn toàn hàm onSubmit
  onSubmit(): void {
    // SỬA: Cập nhật thông báo lỗi
    if (this.registerForm.invalid || !this.selectedFile) {
      this.message = 'Vui lòng điền đầy đủ thông tin và tải lên ảnh cà vẹt.';
      this.isError = true;
      // Đảm bảo tất cả các trường đều bị "touched" để hiển thị lỗi validation (nếu có)
      this.registerForm.markAllAsTouched(); 
      return;
    }

    // MỚI: Tạo FormData thay vì JSON
    const formData = new FormData();
    const formValue = this.registerForm.getRawValue(); // Lấy tất cả giá trị, kể cả disabled

    // Thêm từng trường vào FormData
    // Tên (key) phải khớp chính xác với tên thuộc tính trong AddVehicleRequestDto ở backend
    formData.append('model', formValue.model);
    formData.append('type', formValue.type.toString());
    formData.append('batteryCapacityKWh', formValue.batteryCapacityKWh.toString());
    formData.append('maxChargingPowerKW', formValue.maxChargingPowerKW.toString());
    formData.append('connectorType', formValue.connectorType.toString()); // Đảm bảo backend có thể parse giá trị này (enum)
    formData.append('plate', formValue.plate);
    
    // MỚI: Thêm file vào FormData
    // Key "registrationImage" phải khớp với tên thuộc tính IFormFile trong DTO
    formData.append('registrationImage', this.selectedFile, this.selectedFile.name);

    // MỚI: Gọi service với formData
    // Bạn SẼ CẦN phải cập nhật 'vehicleservice.register' để chấp nhận FormData
    this.vehicleservice.register(formData).subscribe({
        next: (res) => {
            this.message = "Đăng ký xe thành công! Xe của bạn đang chờ duyệt.";
            this.isError = false;
            // Chờ 2 giây rồi redirect (cho người dùng đọc thông báo)
            setTimeout(() => {
               window.location.href = '/'; // Chuyển đến trang quản lý xe
            }, 2000);

            // Reset form
            this.registerForm.reset();
            this.registerForm.get('model')?.disable();
            this.vehicleModels = [];
            this.canHaveDualBattery = false;
            this.selectedFile = null;

            // MỚI: Reset trường input file
            if (this.fileInput) {
              this.fileInput.nativeElement.value = "";
            }
            
            this.cdRef.detectChanges();
        },
        error: (err) => {
            this.message = err.error?.message || 'Có lỗi xảy ra, vui lòng thử lại.';
            this.isError = true;
        }
    });
  }

  ngOnDestroy(): void {
    this.typeChangesSub?.unsubscribe();
    this.modelChangesSub?.unsubscribe();
    this.dualBatterySub?.unsubscribe();
  }
}