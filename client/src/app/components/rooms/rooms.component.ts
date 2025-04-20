import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { HotelService } from '../../services/hotel.service';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { Room } from '../../models/room.model';
import { MatDialog } from '@angular/material/dialog';
import { RoomDetailModalComponent } from '../room-detail-modal/room-detail-modal.component';
import { LoadingIndicatorComponent } from '../shared/loading-indicator/loading-indicator.component';
import { Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, MaterialModule, LoadingIndicatorComponent, TranslateModule, ReactiveFormsModule],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss'
})
export class RoomsComponent implements OnInit, OnDestroy {
  rooms: Room[] = [];
  filteredRooms: Room[] = [];
  loading = false;
  error = false;
  
  searchForm: FormGroup;
  minDate = new Date();
  minCheckOutDate = new Date(this.minDate.getTime() + 86400000); // Tomorrow
  
  private destroy$ = new Subject<void>();

  constructor(
    private hotelService: HotelService,
    private errorService: ErrorHandlingService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    // Initialize search form
    this.searchForm = this.fb.group({
      checkInDate: [null, Validators.required],
      checkOutDate: [null, Validators.required],
      adults: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      children: [0, [Validators.min(0), Validators.max(10)]]
    });
    
    // Update min checkout date when check-in date changes
    this.searchForm.get('checkInDate')?.valueChanges.subscribe(date => {
      if (date) {
        const checkInDate = new Date(date);
        this.minCheckOutDate = new Date(checkInDate.getTime() + 86400000); // Next day
        
        // Reset checkout date if it's before the new min date
        const currentCheckOutDate = this.searchForm.get('checkOutDate')?.value;
        if (currentCheckOutDate && new Date(currentCheckOutDate) < this.minCheckOutDate) {
          this.searchForm.get('checkOutDate')?.setValue(null);
        }
      }
    });
  }

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

  onSearch(): void {
    if (this.searchForm.valid) {
      const checkInDate = this.searchForm.get('checkInDate')?.value;
      const checkOutDate = this.searchForm.get('checkOutDate')?.value;
      
      this.loading = true;
      
      this.hotelService.getAvailableRoomsAsync(checkInDate, checkOutDate)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (rooms) => {
            this.filteredRooms = rooms;
            this.loading = false;
          },
          error: (error) => {
            this.loading = false;
            this.errorService.handleError(error);
          }
        });
    }
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

  retryLoading(): void {
    this.loadRooms();
  }
}
