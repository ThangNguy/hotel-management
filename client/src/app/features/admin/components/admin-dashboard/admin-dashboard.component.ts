import { Component, OnInit } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { BookingStatusService, HotelService, ReportService } from '../../../../core/services';
import { Booking, BookingStatus } from '../../../../models/booking.model';
import { DashboardStats } from '../../../../models/report.model';

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
    RouterLink
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

  // Chart data
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Monthly Revenue',
        backgroundColor: 'rgba(63, 81, 181, 0.2)',
        borderColor: '#3f51b5',
        pointBackgroundColor: '#3f51b5',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3f51b5',
        fill: 'origin',
      }
    ]
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + value
        }
      }
    }
  };

  public lineChartType: ChartType = 'line';
  displayedColumns: string[] = ['id', 'guestName', 'roomType', 'checkIn', 'checkOut', 'status', 'totalPrice'];

  // Data loading state
  isLoading = true;

  constructor(
    private hotelService: HotelService,
    private bookingStatusService: BookingStatusService,
    private reportService: ReportService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;

    // Load aggregated stats from Backend
    this.reportService.getDashboardStats().subscribe({
      next: (stats: DashboardStats) => {
        this.totalRooms = stats.totalRooms;
        this.availableRooms = stats.availableRooms;
        this.occupancyRate = stats.occupancyRate;
        this.totalBookings = stats.totalBookings;
        this.monthlyRevenue = stats.monthlyRevenue;
      },
      error: (err) => console.error('Failed to load dashboard stats', err)
    });

    // Load recent bookings list
    this.hotelService.getBookingsAsync().subscribe({
      next: (bookings: Booking[]) => {
        this.recentBookings = this.getRecentBookings(bookings, 5);
      },
      error: (err) => console.error('Failed to load recent bookings', err)
    });

    // Load revenue chart data
    this.reportService.getMonthlyRevenue(6).subscribe({
      next: (data) => {
        this.lineChartData.labels = data.map(d => d.month);
        this.lineChartData.datasets[0].data = data.map(d => d.revenue);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load revenue data', err);
        this.isLoading = false;
      }
    });
  }

  // Removed local calculation methods as logic moved to Backend

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
          roomType: room ? room.name : 'Undefined'
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
    return this.bookingStatusService.getStatusLabel(status);
  }

  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US');
  }

  getFormattedPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }
}