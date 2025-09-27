import { Component } from '@angular/core';

@Component({
  selector: 'app-dich-vu',
  standalone: true,               // cần nếu bạn không khai báo DichVu trong module
  templateUrl: './dich-vu.html',
  styleUrls: ['./dich-vu.css']    // ✅ sửa thành styleUrls
})
export class DichVu {}
