import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PresenceService } from '../../core/service/presence-service';

interface ChargingUser {
  name: string;
  registered: boolean;
  plateNumber?: string;
}

interface ChargingSlot {
  id: string;
  status: 'charging' | 'available';
  type: 'vãng lai' | 'đặt trước';
  user?: ChargingUser;
  startTime?: Date;
  plateInput?: string; // biển số nhập tạm thời từ nhân viên
}


@Component({
  selector: 'app-operator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operator.html',
  styleUrl: './operator.css'
})
export class Operator implements OnInit {
  private presenceService = inject(PresenceService);
  station = {
    name: 'Trạm Sạc EV - Nguyễn Văn Cừ',
    address: '123 Nguyễn Văn Cừ, Quận 5, TP.HCM',
    totalSlots: 6,
    activeSlots: 3,
  };

  // giả lập data người dùng đã đăng ký
  registeredUsers: ChargingUser[] = [
    { name: 'Nguyễn Văn A', registered: true, plateNumber: '51A-12345' },
    { name: 'Trần Thị B', registered: true, plateNumber: '59C-67890' }
  ];

  chargingSlots: ChargingSlot[] = [];

  ngOnInit() {
    this.chargingSlots = [
      {
        id: 'EV-01',
        status: 'charging',
        type: 'đặt trước',
        user: { name: 'Nguyễn Văn A', registered: true, plateNumber: '51A-12345' },
        startTime: new Date('2025-10-31T08:00:00')
      },
      {
        id: 'EV-02',
        status: 'charging',
        type: 'vãng lai',
        startTime: new Date('2025-10-31T08:30:00')
      },
      {
        id: 'EV-03',
        status: 'available',
        type: 'vãng lai'
      }
    ];
  }

  // Hàm khi nhân viên nhập biển số xe
  checkPlate(slot: ChargingSlot) {
    const foundUser = this.registeredUsers.find(
      u => u.plateNumber?.toLowerCase() === slot.plateInput?.toLowerCase()
    );

    if (foundUser) {
      slot.user = foundUser;
    } else {
      slot.user = { name: 'Người dùng chưa xác định', registered: false };
    }
  }
}