import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material/material.module';
import { HotelService } from '../../../../core/services/hotel.service';
import { Room } from '../../../../models/room.model';
import { RoomDetailModalComponent } from '../room-detail-modal/room-detail-modal.component';
import { LoadingIndicatorComponent } from '../shared/loading-indicator/loading-indicator.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, MaterialModule, LoadingIndicatorComponent],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomsComponent implements OnInit {
  rooms = signal<Room[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  
  searchActive = signal(false);
  searchParams = signal<any>({});
  
  // Create an array for skeleton loaders (e.g., show 6 skeleton cards while loading)
  skeletonArray = Array(6).fill(0);

  private hotelService = inject(HotelService);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        if (params['checkIn'] && params['checkOut']) {
          this.searchActive.set(true);
          this.searchParams.set(params);
          this.searchAvailableRooms(
            new Date(params['checkIn']),
            new Date(params['checkOut']),
            params['adults'] ? +params['adults'] : undefined,
            params['children'] ? +params['children'] : undefined
          );
        } else {
          this.searchActive.set(false);
          this.loadAllRooms();
        }
      });
  }

  loadAllRooms(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.hotelService.getRoomsAsync()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Room[]) => {
          this.rooms.set(data);
          this.loading.set(false);
        },
        error: (err: any) => {
          console.error('Error loading rooms', err);
          this.error.set('Failed to load rooms');
          this.loading.set(false);
        }
      });
  }

  searchAvailableRooms(checkIn: Date, checkOut: Date, adults?: number, children?: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.hotelService.getAvailableRoomsAsync(checkIn, checkOut)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Room[]) => {
          this.rooms.set(data);
          this.loading.set(false);
        },
        error: (err: any) => {
          console.error('Error searching rooms', err);
          this.error.set('Failed to search rooms');
          this.loading.set(false);
        }
      });
  }

  clearSearch(): void {
    this.searchActive.set(false);
    this.searchParams.set({});
    
    // Update URL to remove query params without reloading the page
    const currentUrl = window.location.pathname;
    window.history.replaceState({}, document.title, currentUrl);
    
    this.loadAllRooms();
  }

  retryLoading(): void {
    if (this.searchActive()) {
      const p = this.searchParams();
      this.searchAvailableRooms(new Date(p.checkIn), new Date(p.checkOut), p.adults, p.children);
    } else {
      this.loadAllRooms();
    }
  }

  openRoomDetails(room: Room): void {
    this.dialog.open(RoomDetailModalComponent, {
      width: '800px',
      maxWidth: '95vw',
      panelClass: 'modern-dialog',
      data: { room, searchParams: this.searchActive() ? this.searchParams() : null }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }

  trackByRoomId(index: number, room: Room): number {
    return room.id;
  }
}
