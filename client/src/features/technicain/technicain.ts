import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AccountService } from '../../core/service/account-service';
import { StationService } from '../../core/service/station-service';
import { ToastService } from '../../core/service/toast-service';
import { Task } from '../../_models/report';
import { TechnicainService } from '../../core/service/technicain-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-technicain',
  imports: [CommonModule,FormsModule],
  standalone: true,
  templateUrl: './technicain.html',
  styleUrl: './technicain.css',
})
export class Technicain {
  protected stationService = inject(StationService);
  private technicainService = inject(TechnicainService);
  private toast = inject(ToastService);
  private cdf = inject(ChangeDetectorRef);
  isStarting = false;
  task : Task[] = [];
  startedTasks = new Set<number>();
  resolvedTasks = new Set<number>();

  ngOnInit(){
    this.getTask();
  }


   getTask(){
      this.technicainService.getMyTask().subscribe({
        next : (res) =>{
          this.task = res;
          this.cdf.detectChanges();
        },error : (err) =>{
          this.toast.error('Lỗi tải danh sách công việc')
        }
      })
   }

   startrepair( id : number){
    this.startedTasks.add(id);
    this.cdf.detectChanges();
       this.technicainService.startRepair(id).subscribe({
        next : (res) =>{
          this.toast.success(res.message);
         setTimeout(() => {
          this.startedTasks.delete(id);
          this.resolvedTasks.add(id); // cho phép hiện nút "Hoàn tất sửa"
          const task = this.task.find((t) => t.id === id);
          if (task) task.status = 'Resolved';
          this.toast.success(`Công việc #${id} đã sửa xong `);
          this.getTask();
          this.cdf.detectChanges();
        }, 5000);

        },
        error : (err) =>{
          this.toast.error(err.message)
        }
       })
   }

   completeRepair(id:number,fixedNote: string,file? : File){
    const payload = new FormData();

     payload.append('FixedNote', fixedNote);

    if(file){
      payload.append('CompletedImage',file);
    }

    this.technicainService.completeRepair(id,payload).subscribe({
      next : (res) =>{
        this.toast.success(res.message);
         this.task = this.task.filter((t) => t.id !== id);
        this.resolvedTasks.delete(id);
        this.cdf.detectChanges();
      }
    })

   }
  


}
