import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, NgClass, DatePipe, CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { BookingStatusService, HotelService } from '../../../../core/services';
import { Booking, BookingStatus } from '../../../../models/booking.model';
import { Room } from '../../../../models/room.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    NgClass,
    RouterLink,
    DatePipe,
    CurrencyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnInit {
  // Dashboard Metrics Signals
  totalRooms = signal(0);
  availableRooms = signal(0);
  occupancyRate = signal(0);
  totalBookings = signal(0);
  monthlyRevenue = signal(0);
  
  // Collections Signals
  recentBookings = signal<(Booking & { roomType: string })[]>([]);
  displayedColumns: string[] = ['id', 'guestName', 'roomType', 'checkIn', 'checkOut', 'status', 'totalPrice'];
  
  // State Signals
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Injections
  private hotelService = inject(HotelService);
  private bookingStatusService = inject(BookingStatusService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Using forkJoin to load all required async data in parallel
    forkJoin({
      rooms: this.hotelService.getRoomsAsync(),
      bookings: this.hotelService.getBookingsAsync()
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: ({ rooms, bookings }) => {
        this.processDashboardMetrics(rooms, bookings);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.error.set('Failed to load dashboard data. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  private processDashboardMetrics(rooms: Room[], bookings: Booking[]): void {
    // Rooms metrics
    const available = this.calculateAvailableRooms(rooms);
    this.totalRooms.set(rooms.length);
    this.availableRooms.set(available);
    
    if (rooms.length > 0) {
      this.occupancyRate.set(((rooms.length - available) / rooms.length) * 100);
    } else {
      this.occupancyRate.set(0);
    }

    // Bookings metrics
    this.totalBookings.set(bookings.length);
    this.monthlyRevenue.set(this.calculateMonthlyRevenue(bookings));
    this.recentBookings.set(this.getRecentBookings(bookings, rooms, 5));
  }

  private calculateAvailableRooms(rooms: Room[]): number {
    const currentDate = new Date();
    // In a real app, this logic should be on the backend, but we're mimicking the existing logic
    return rooms.filter(room => this.hotelService.checkRoomAvailability(room.id, currentDate, currentDate)).length;
  }

  private calculateMonthlyRevenue(bookings: Booking[]): number {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    return bookings
      .filter(booking => {
        const dateValue = booking.checkInDate || booking.createdAt;
        const bookingDate = dateValue ? new Date(dateValue) : new Date();
        return bookingDate >= firstDayOfMonth && bookingDate <= currentDate;
      })
      .reduce((total, booking) => total + (booking.totalPrice || 0), 0);
  }

  private getRecentBookings(bookings: Booking[], rooms: Room[], count: number): (Booking & { roomType: string })[] {
    return [...bookings]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, count)
      .map(booking => {
        const room = rooms.find(r => r.id === booking.roomId);
        return {
          ...booking,
          roomType: room ? room.name : `Room #${booking.roomId}`
        };
      });
  }

  getBookingStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case BookingStatus.CONFIRMED: return 'status-confirmed';
      case BookingStatus.CHECKED_IN: return 'status-checked-in';
      case BookingStatus.CHECKED_OUT: return 'status-checked-out';
      case BookingStatus.CANCELLED: return 'status-cancelled';
      case BookingStatus.PENDING: return 'status-pending';
      default: return '';
    }
  }
  
  getStatusLabel(status: string): string {
    // Casting to BookingStatus since strings might come from backend
    return this.bookingStatusService.getStatusLabel(status as BookingStatus);
  }

  retry(): void {
    this.loadDashboardData();
  }
}