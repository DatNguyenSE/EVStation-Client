import { Component, inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { VehicleService } from '../../core/service/vehicle-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Vehicles, VehicleModelDetail } from '../../_models/user'; // Đảm bảo import VehicleModelDetail

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
      plate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.listenToTypeChanges();
    this.listenToModelChanges();
    this.listenToDualBatteryChanges();
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

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.message = 'Vui lòng điền đầy đủ thông tin.';
      this.isError = true;
      return;
    }
    const vehicle: Vehicles = this.registerForm.getRawValue();
    this.vehicleservice.register(vehicle).subscribe({
        next: (res) => {
            this.message = "Đăng ký xe thành công!";
            this.isError = false;
            this.registerForm.reset();
            this.registerForm.get('model')?.disable();
            this.vehicleModels = [];
            this.canHaveDualBattery = false;
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