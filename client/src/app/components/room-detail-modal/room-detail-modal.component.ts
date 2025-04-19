import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../material/material.module';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-room-detail-modal',
  standalone: true,
  imports: [CommonModule, MaterialModule, MatDialogModule],
  templateUrl: './room-detail-modal.component.html',
  styleUrl: './room-detail-modal.component.scss'
})
export class RoomDetailModalComponent {
  constructor(
    public dialogRef: MatDialogRef<RoomDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public room: Room
  ) {}

  closeDialog(): void {
    this.dialogRef.close();
  }

  // Hiển thị giá theo định dạng VND
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
}
