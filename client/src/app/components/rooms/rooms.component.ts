import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { HotelService } from '../../services/hotel.service';
import { Room } from '../../models/room.model';
import { MatDialog } from '@angular/material/dialog';
import { RoomDetailModalComponent } from '../room-detail-modal/room-detail-modal.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];

  constructor(
    private hotelService: HotelService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.rooms = this.hotelService.getRooms();
  }

  openRoomDetails(room: Room): void {
    this.dialog.open(RoomDetailModalComponent, {
      width: '800px',
      data: room
    });
  }

  // Hiển thị giá theo định dạng VND
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
}
