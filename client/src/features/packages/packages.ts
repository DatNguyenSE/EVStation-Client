import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { PackagesService } from '../../core/service/packages-service';
import { Package } from '../../_models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-packages',
  imports: [CommonModule,FormsModule],
  templateUrl: './packages.html',
  styleUrl: './packages.css'
})
export class Packages {
    package : Package[]=[];
    selectedPackage: string | null = null;
    private packageservice = inject(PackagesService);
    private cdRef = inject(ChangeDetectorRef);
    ngOnInit(){
          this.getPackages(); 
    }
    getPackages(){
      this.packageservice.getPackages().subscribe({
        next : (data) =>{
          this.package=data;
          this.cdRef.detectChanges();
        }
      })
    }
     selectPackage(vehicleType: string) {
    this.selectedPackage = vehicleType;
  }
}
