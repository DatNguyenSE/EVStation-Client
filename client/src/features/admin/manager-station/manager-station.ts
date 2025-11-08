import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { StationService } from '../../../core/service/station-service';
import { DtoStation, Post } from '../../../_models/station';
import { ToastService } from '../../../core/service/toast-service';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../../core/service/post-service';
 import Swal from 'sweetalert2';

@Component({
  selector: 'app-manager-station',
  standalone:true,
  imports: [CommonModule,FormsModule],
  templateUrl: './manager-station.html',
  styleUrl: './manager-station.css',
})
export class ManagerStation {
  private stationSvc = inject(StationService);
  private toast = inject(ToastService);
  private cdf = inject(ChangeDetectorRef);
  private postSvc = inject(PostService);
  station : DtoStation[] = [];
  post : Post[] = [];
  message = '';
  newStation: Partial<DtoStation> = {
    code: '',
    name: '',
    address: '',
    openTime: '',
    closeTime: '',
    status: 'Active',
    latitude: 0,
    longtitude: 0,
    description: '',
    chargingPosts:[],
  };
  newPost : Partial<Post> = {
    stationId:0,
    code:'',
    type:'',
    powerKW:'',
    connectorType:'',
    status:'Available',
    isWalkIn:false,
  }
  editingStation: DtoStation | null = null;
  selectedStation: DtoStation | null = null;
  viewingStation: DtoStation | null = null;

  
  

  ngOnInit(){    
    this.loadStation();
  }
   
// Kiểm tra xem station có posts không
viewPosts(station: DtoStation) {
  this.viewingStation = { ...station, chargingPosts: [] };

  this.stationSvc.getPostsByStationId(station.id).subscribe({
    next: (post) => {
      this.viewingStation = {
        ...(this.viewingStation as DtoStation),
        chargingPosts: post,
      };
      this.cdf.detectChanges();
    },
    error: (err) => {
      this.toast.error('Không thể tải danh sách trụ');
    },
  });
}



  // gọi lại danh sách trụ 
 loadStation() {
  this.stationSvc.getStations().subscribe({
    next: (res) => {
     
      this.station = res.map((s) => ({
        ...s,
        chargingPosts: (s.chargingPosts).map((p) => ({
          ...p,
          id: p.id,
        })),
      }));
      this.cdf.detectChanges();
    },
    error: (err) => {
      this.message = err.message;
    },
  });
}



  // thêm trụ
  addStation(){
    const payload ={
      name: this.newStation.name,
      address : this.newStation.address,
      description : this.newStation.description,
      latitude: this.newStation.latitude,
      longtitude:this.newStation.longtitude,
      openTime : this.newStation.openTime,
      closeTime : this.newStation.closeTime,
      posts : this.newStation.chargingPosts?.map((p : Post) => ({
        id: p.id,
        type : p.type,
        connectorType : p.connectorType,
        powerKW : p.powerKW,
        status : p.status,
        isWalkIn : p.isWalkIn
      })

    )}
    this.stationSvc.addStation(payload).subscribe({
      next : (res) =>{
      const stationName = res.name ?? '(không rõ tên)';
        this.toast.success(`Bạn Đã Thêm Trạm Thành Công tại: ${stationName}`);
        this.station.push(res);
        this.newStation = {
          name: '',
          address: '',
          description: '',
          latitude: 0,
          longtitude: 0,
          openTime: '',
          closeTime: '',
          chargingPosts: [],
        };
        this.cdf.detectChanges();
        this.loadStation();
      },
      error :(err) =>{
          this.message = err.error?.message;
      }
    })
  }

  // Xóa Tu
removePost(id: number) {
  Swal.fire({
    title: 'Bạn có chắc muốn xóa trụ này?',
    text: "Hành động này không thể hoàn tác!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Xóa',
    cancelButtonText: 'Hủy'
  }).then((result) => {
    if (result.isConfirmed) {
      this.postSvc.deletePost(id).subscribe({
        next: (res) => {
          this.toast.success(`Đã Xóa Trụ Thành Công`);
          if (this.viewingStation) {
            this.viewingStation.chargingPosts = this.viewingStation.chargingPosts.filter(p => p.id !== id);
             
            const idx = this.station.findIndex(s => s.id === this.viewingStation!.id);
            if (idx !== -1) {
              this.station[idx].chargingPosts = this.viewingStation.chargingPosts;
            }
          }
          this.cdf.detectChanges();
        },
        error: (err) => {
          this.toast.error(err.message);
        }
      });
    }
  });
}


  // thêm trụ vào trạm sạc hiện có 
  addPostToStations(stationId : number){
     if (!this.selectedStation?.id) {
      this.toast.warning('Hãy chọn trạm trước khi thêm trụ');
      return;
    }
    this.postSvc.addPostToStation(stationId,this.newPost).subscribe({
      next : (res) =>{
           this.toast.success(`Đã thêm trụ cho ${this.selectedStation?.name}`);
            const stationIndex = this.station.findIndex(s => s.id === stationId);
      if (stationIndex !== -1) {
        this.station[stationIndex].chargingPosts.push(res);
      }

      // Nếu đang xem trạm đó trong modal
      if (this.viewingStation?.id === stationId) {
        this.viewingStation.chargingPosts.push(res);
      }
           this.newPost = {type:'',connectorType:'',powerKW:'',status:'Available',isWalkIn:false};
           this.cdf.detectChanges();
      },
      error: (err) => this.toast.error(err.error?.message || ' Không thể thêm trụ'),
    });
  }

  // update Station
  editStation(station: DtoStation) {
  this.editingStation = { ...station }; // sao chép dữ liệu ra để chỉnh sửa
}
 updateStation() {
  if (!this.editingStation) return;

  this.stationSvc.updateStation(this.editingStation.id!, this.editingStation).subscribe({
    next: (res) => {
      const idx = this.station.findIndex(s => s.id === res.id);
      if (idx !== -1) {
        // 🟢 Gộp thông tin mới, nhưng vẫn giữ nguyên trụ cũ
        this.station[idx] = {
          ...this.station[idx], // giữ lại toàn bộ dữ liệu cũ (gồm chargingPosts)
          ...res,               // đè thông tin mới lên
          chargingPosts: this.station[idx].chargingPosts // ép giữ lại trụ
        };
      }

      this.toast.success(`✅ Cập nhật trạm "${res.name}" thành công`);
      this.editingStation = null;
    },
    error: (err) => {
      this.toast.error(err.error?.message || 'Không thể cập nhật trạm');
    }
  });
}

  
  // update status station
changeStationStatus(station: DtoStation) {
  const statusToNumber: Record<string, number> = {
    Active: 0,
    Inactive: 1,
    Maintenance: 2,
  };

  const statusCode = statusToNumber[station.status];

  this.stationSvc.updateStationStatus(station.id, statusCode).subscribe({
    next: () => {
      this.toast.success(`Trạm ${station.name} đã chuyển sang ${station.status}`);

      // Nếu modal đang mở đúng trạm đó → reload lại dữ liệu DB
      if (this.viewingStation && this.viewingStation.id === station.id) {
        console.log('🌀 Reload danh sách trụ từ DB sau khi đổi trạng thái...');
        this.viewPosts(station);
      }

      // Cập nhật danh sách chính
      const idx = this.station.findIndex(s => s.id === station.id);
      if (idx !== -1) {
        this.station[idx].status = station.status;
      }

      this.cdf.detectChanges();
    },
    error: (err) => {
      this.toast.error(err.error?.message || 'Không thể cập nhật trạng thái trạm');
      console.error(err);
    },
  });
}









 // update status post 
 changePostStatus(post: Post) {
  const statusToNumber: Record<string, number> = {
    Available: 0,
    Occupied: 1,
    Maintenance: 2,
    Offline: 3,
  };

  // Kiểm tra id có hợp lệ không
  if (!post.id) {
    this.toast.error('Không thể cập nhật: ID trụ không hợp lệ');
    return;
  }

  // Chuyển status sang number để gửi BE
  const statusNumber = statusToNumber[post.status];
  if (statusNumber === undefined) {
    this.toast.error(' Giá trị trạng thái không hợp lệ');
    return;
  }

  // Gọi API update
  this.postSvc.updateStatusPost(post.id, statusNumber).subscribe({
    next: (res) => {
      // res có thể là post đã cập nhật (tuỳ BE trả gì)
    
      this.toast.success(`Trụ ${post.code} đã đổi sang ${post.status}`);
      console.log('Update success:', res);

      // Cập nhật UI trực tiếp
      post.status = Object.keys(statusToNumber).find(
        key => statusToNumber[key] === statusNumber
      ) as string;
    },
    error: (err) => {
      console.error('Update error:', err);
      this.toast.error(err.error?.message || 'Không thể cập nhật trạng thái trụ');
    },
  });
}





  cancelEdit(){
    this.editingStation = null
  }

  /** ➕ Thêm trụ tạm (UI, chưa lưu DB) */
 addPostRow() {
  if (!this.newStation.chargingPosts) {
    this.newStation.chargingPosts = [];
  }

  const newPost: Post = {
    id: 0,
    stationId: this.selectedStation?.id ?? 0,
    code: '',
    type: this.newPost.type || '',
    powerKW: String(this.newPost.powerKW || ''),
    connectorType: this.newPost.connectorType || '',
    status: this.newPost.status || 'Available',
    isWalkIn: !!this.newPost.isWalkIn,
  };

  this.newStation.chargingPosts.push(newPost);

  // reset input
  this.newPost = {
    type: '',
    connectorType: '',
    powerKW: '',
    status: 'Available',
    isWalkIn: false,
  };
}




  // Xóa Trạm 
  removeStation(id:number){
     if(confirm('Bạn Có Chắc Xóa Trạm này đi không ?')){
      this.stationSvc.deleteStation(id).subscribe({
        next : () => {
          this.toast.success(`Bạn Đã Xóa Trạm Thành Công`);
           this.cdf.detectChanges();
          this.loadStation();
        },
        error : (err) =>{
          this.message = err.message
        }
      })
     }
  }

  
}
