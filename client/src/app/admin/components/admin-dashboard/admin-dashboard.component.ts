import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { HotelService } from '../../../services/hotel.service';
import { Booking, BookingStatus } from '../../../models/booking.model';
import { Room } from '../../../models/room.model';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BookingStatusTranslationService } from '../../../services/booking-status-translation.service';

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
    TranslateModule
  ]
})
export class AdminDashboardComponent implements OnInit {
  // Dashboard metrics
  totalRooms = 0;
  availableRooms = 0;
  occupancyRate = 0;
  totalBookings = 0;
  monthlyRevenue = 0;
  
  // Recent bookings
  recentBookings: Booking[] = [];
  displayedColumns: string[] = ['id', 'guestName', 'roomType', 'checkIn', 'checkOut', 'status', 'totalPrice'];
  
  // Data loading state
  isLoading = true;

  constructor(
    private hotelService: HotelService,
    private translate: TranslateService,
    private bookingStatusService: BookingStatusTranslationService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    // Load rooms first
    const rooms = this.hotelService.getRooms();
    this.totalRooms = rooms.length;
    this.availableRooms = this.calculateAvailableRooms(rooms);
    
    if (this.totalRooms > 0) {
      this.occupancyRate = ((this.totalRooms - this.availableRooms) / this.totalRooms) * 100;
    }
    
    // Then load bookings
    this.loadBookingsData();
  }
  
  loadBookingsData(): void {
    // Get bookings data directly then use getBookingsAsync for Observable approach
    const bookings = this.hotelService.getBookings();
    this.totalBookings = bookings.length;
    this.monthlyRevenue = this.calculateMonthlyRevenue(bookings);
    this.recentBookings = this.getRecentBookings(bookings, 5);
    this.isLoading = false;
  }

  private calculateAvailableRooms(rooms: Room[]): number {
    // Check which rooms are currently available today
    const currentDate = new Date();
    
    return rooms.filter(room => {
      return this.hotelService.checkRoomAvailability(
        room.id, 
        currentDate, 
        currentDate
      );
    }).length;
  }

  private calculateOccupancyRate(): number {
    if (this.totalRooms === 0) return 0;
    return ((this.totalRooms - this.availableRooms) / this.totalRooms) * 100;
  }

  private calculateMonthlyRevenue(bookings: Booking[]): number {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Sum up revenue from bookings in the current month
    return bookings
      .filter(booking => {
        const bookingDate = new Date(booking.checkInDate);
        return bookingDate >= firstDayOfMonth && bookingDate <= currentDate;
      })
      .reduce((total, booking) => total + (booking.totalPrice || 0), 0);
  }

  private getRecentBookings(bookings: Booking[], count: number): Booking[] {
    // Sort bookings by date (newest first) using createdAt field
    return [...bookings]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, count)
      .map(booking => {
        // Add room type to each booking for the table
        const room = this.hotelService.getRoomById(booking.roomId);
        return {
          ...booking,
          roomType: room ? room.name : this.translate.instant('COMMON.UNDEFINED')
        } as Booking & { roomType: string };
      });
  }

  getBookingStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case BookingStatus.CONFIRMED: return 'status-confirmed';
      case BookingStatus.CHECKED_IN: return 'status-checked-in';
      case BookingStatus.CHECKED_OUT: return 'status-checked-out';
      case BookingStatus.CANCELLED: return 'status-cancelled';
      default: return '';
    }
  }
  
  getStatusLabel(status: BookingStatus): string {
    return this.bookingStatusService.getStatusTranslationSync(status);
  }
  
  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString(this.translate.currentLang === 'en' ? 'en-US' : 'vi-VN');
  }

  getFormattedPrice(price: number): string {
    return new Intl.NumberFormat(this.translate.currentLang === 'en' ? 'en-US' : 'vi-VN', { 
      style: 'currency', 
      currency: this.translate.currentLang === 'en' ? 'USD' : 'VND',
      minimumFractionDigits: 0
    }).format(price);
  }
}