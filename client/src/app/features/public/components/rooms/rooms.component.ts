import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material.module';
import { Room } from '../../../../models/room.model';
import { MatDialog } from '@angular/material/dialog';
import { RoomDetailModalComponent } from '../room-detail-modal/room-detail-modal.component';
import { LoadingIndicatorComponent } from '../shared/loading-indicator/loading-indicator.component';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
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

  searchActive = false;
  searchParams: { checkIn?: string; checkOut?: string; adults?: number; children?: number } = {};

  constructor(
    private hotelService: HotelService,
    private errorService: ErrorHandlingService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['checkIn'] && params['checkOut']) {
        this.searchActive = true;
        this.searchParams = params;
        this.loadAvailableRooms(new Date(params['checkIn']), new Date(params['checkOut']));
      } else {
        this.searchActive = false;
        this.loadRooms();
      }
    });
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
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.error = true;
          this.errorService.handleError(error);
        }
      });
  }

  loadAvailableRooms(checkIn: Date, checkOut: Date): void {
    this.loading = true;
    this.error = false;

    this.hotelService.getAvailableRoomsAsync(checkIn, checkOut)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rooms) => {
          this.rooms = rooms;
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

  clearSearch(): void {
    this.searchActive = false;
    this.searchParams = {};
    // Remove query params from URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
    this.loadRooms();
  }
}
