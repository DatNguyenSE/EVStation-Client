import { Component, inject, model,ChangeDetectorRef } from '@angular/core';
import { VehicleService } from '../../core/service/vehicle-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Vehicle } from '../../_models/user';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register-vehicle',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './register-vehicle.html',
  styleUrl: './register-vehicle.css'
})
export class RegisterVehicle {
    vehicleservice = inject(VehicleService);
    private fb = inject(FormBuilder);
    private cdRef = inject(ChangeDetectorRef);

    registerForm : FormGroup = this.fb.group({
      model :['',Validators.required],
      type :['',Validators.required],
      batteryCapacityKWh :[null,[Validators.required,Validators.min(1)]],
      maxChargingPowerKW :[null,[Validators.required,Validators.min(1)]],
      connectorType :['',Validators.required],
      plate :['',Validators.required]

    });
      connectorTypes = ['Type2', 'CCS2', 'VinEScooter'];
      message ='';
      isError=false;
    

      onSubmit() : void{
        if(this.registerForm.invalid){
          this.message ='Vui lòng điền đầy đủ thông tin.',
          this.isError = true;
          return
        }

        const vehicle : Vehicle  = this.registerForm.value;

        this.vehicleservice.register(vehicle).subscribe({
          next:(res) =>{
            this.message = res.message;
            this.isError =false;
            this.cdRef.detectChanges();
            this.registerForm.reset;
          },
          error :(err) =>{
            this.message = err.error.message;
            this.isError = true;
          }

        })

      }
      


}
