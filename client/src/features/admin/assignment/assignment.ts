import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AdminService } from '../../../core/service/admin-service';
import { assignments } from '../../../_models/assgin';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from '../../../core/service/toast-service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assignment',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  standalone: true,
  templateUrl: './assignment.html',
  styleUrl: './assignment.css',
})
export class Assignment {

  private adminSvc = inject(AdminService);
  private cdf = inject(ChangeDetectorRef);
  assign : assignments | null = null;
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  loading = false;
  message = '';
 assignForm: FormGroup = this.fb.group({
    staffId: [''],
    stationId: [''],
    effectiveFrom: [''],
    effectiveTo: [''],
  });
  
   submitAssignment() {
    this.loading = true;
    this.message = '';

    const formValue = this.assignForm.value;
    const payload = {
      staffId: formValue.staffId,
      stationId: Number(formValue.stationId),
      effectiveFrom: new Date(formValue.effectiveFrom).toISOString(),
      effectiveTo: new Date(formValue.effectiveTo).toISOString(),
    };

    this.adminSvc.assgin(payload).subscribe({
      next: (res : any ) => {
        this.toast.success(`Phân Trạm thành công Cho  ${res.staff.fullName} tại ${res.station.name}`);
         setTimeout(()=>{
          this.router.navigate(['/quan-tri-vien/trang-chu'])
         },2000);
        this.assignForm.reset();
        this.loading = false;
        this.cdf.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.message = 'Failed to create assignment.';
        this.loading = false;
        this.cdf.detectChanges();
      },
    });
  }


}
