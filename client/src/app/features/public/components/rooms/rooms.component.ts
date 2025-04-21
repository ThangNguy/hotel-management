import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material.module';
import { Room } from '../../../../models/room.model';
import { MatDialog } from '@angular/material/dialog';
import { RoomDetailModalComponent } from '../room-detail-modal/room-detail-modal.component';
import { LoadingIndicatorComponent } from '../shared/loading-indicator/loading-indicator.component';
import { Subject, takeUntil } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { HotelService, ErrorHandlingService } from '../../../../core/services';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, MaterialModule, LoadingIndicatorComponent, ReactiveFormsModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  loading = false;
  error = false;
  
  minDate = new Date();
  minCheckOutDate = new Date(this.minDate.getTime() + 86400000); // Tomorrow
  
  private destroy$ = new Subject<void>();

  constructor(
    private hotelService: HotelService,
    private errorService: ErrorHandlingService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.loadRooms();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRooms(): void {
    this.loading = true;
    this.error = false;
    
    this.hotelService.getRoomsAsync()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rooms) => {
          this.rooms = rooms;
          this.filteredRooms = [...rooms]; // Initially show all rooms
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.error = true;
          this.errorService.handleError(error);
        }
      });
  }

  openRoomDetails(room: Room): void {
    this.dialog.open(RoomDetailModalComponent, {
      width: '800px',
      data: room
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  retryLoading(): void {
    this.loadRooms();
  }
}
