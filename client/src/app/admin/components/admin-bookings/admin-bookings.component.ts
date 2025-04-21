import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HotelService } from '../../../services/hotel.service';
import { Booking, BookingStatus } from '../../../models/booking.model';
import { Room } from '../../../models/room.model';
import { BookingFormDialogComponent } from '../booking-form-dialog/booking-form-dialog.component';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog.component';
import { BookingStatusTranslationService } from '../../../services/booking-status-translation.service';

@Component({
  selector: 'app-admin-bookings',
  templateUrl: './admin-bookings.component.html',
  styleUrls: ['./admin-bookings.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    NgClass,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ]
})
export class AdminBookingsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'guestName', 'room', 'checkInDate', 'checkOutDate', 'totalPrice', 'status', 'actions'];
  dataSource!: MatTableDataSource<Booking>;
  bookings: Booking[] = [];
  rooms: Room[] = [];
  isLoading = false;
  
  bookingStatuses = Object.values(BookingStatus);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private hotelService: HotelService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private bookingStatusService: BookingStatusTranslationService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    
    // Load rooms first
    this.hotelService.getRoomsAsync().subscribe(
      rooms => {
        this.rooms = rooms;
        
        // Then load bookings
        this.hotelService.getBookingsAsync().subscribe(
          bookings => {
            this.bookings = bookings;
            this.dataSource = new MatTableDataSource(bookings);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.isLoading = false;
            
            // Custom sort function for dates
            this.dataSource.sortingDataAccessor = (item: Booking, property: string) => {
              switch (property) {
                case 'checkInDate': return new Date(item.checkInDate).getTime();
                case 'checkOutDate': return new Date(item.checkOutDate).getTime();
                default: return this.getPropertyValue(item, property);
              }
            };
          },
          error => {
            this.snackBar.open('Error loading bookings', 'Close', {
              duration: 3000
            });
            this.isLoading = false;
          }
        );
      },
      error => {
        this.snackBar.open('Error loading rooms', 'Close', {
          duration: 3000
        });
        this.isLoading = false;
      }
    );
  }

  // Helper method to get property values type-safe
  getPropertyValue(obj: Booking, prop: string): any {
    switch (prop) {
      case 'id': return obj.id;
      case 'guestName': return obj.guestName;
      case 'guestEmail': return obj.guestEmail;
      case 'guestPhone': return obj.guestPhone;
      case 'roomId': return obj.roomId;
      case 'checkInDate': return obj.checkInDate;
      case 'checkOutDate': return obj.checkOutDate;
      case 'status': return obj.status;
      case 'totalPrice': return obj.totalPrice;
      case 'numberOfGuests': return obj.numberOfGuests;
      case 'specialRequests': return obj.specialRequests;
      case 'createdAt': return obj.createdAt;
      default: return '';
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  addBooking(): void {
    const dialogRef = this.dialog.open(BookingFormDialogComponent, {
      width: '700px',
      data: { mode: 'add', booking: null, rooms: this.rooms }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.hotelService.addBooking(result).subscribe(
          newBooking => {
            this.snackBar.open('Booking added successfully', 'Close', {
              duration: 3000
            });
            this.loadData();
          },
          error => {
            this.snackBar.open('Error adding booking', 'Close', {
              duration: 3000
            });
            this.isLoading = false;
          }
        );
      }
    });
  }

  editBooking(booking: Booking): void {
    const dialogRef = this.dialog.open(BookingFormDialogComponent, {
      width: '700px',
      data: { mode: 'edit', booking: {...booking}, rooms: this.rooms }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.hotelService.updateBooking(result).subscribe(
          updatedBooking => {
            this.snackBar.open('Booking updated successfully', 'Close', {
              duration: 3000
            });
            this.loadData();
          },
          error => {
            this.snackBar.open('Error updating booking', 'Close', {
              duration: 3000
            });
            this.isLoading = false;
          }
        );
      }
    });
  }

  deleteBooking(booking: Booking): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Booking',
        message: `Are you sure you want to delete the booking for "${booking.guestName}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.hotelService.deleteBooking(booking.id).subscribe(
          success => {
            this.snackBar.open('Booking deleted successfully', 'Close', {
              duration: 3000
            });
            this.loadData();
          },
          error => {
            this.snackBar.open('Error deleting booking', 'Close', {
              duration: 3000
            });
            this.isLoading = false;
          }
        );
      }
    });
  }

  updateBookingStatus(booking: Booking, status: BookingStatus): void {
    this.isLoading = true;
    this.hotelService.updateBookingStatus(booking.id, status).subscribe(
      updatedBooking => {
        this.snackBar.open(`Status updated to ${this.getStatusLabel(status)}`, 'Close', {
          duration: 3000
        });
        this.loadData();
      },
      error => {
        this.snackBar.open('Error updating booking status', 'Close', {
          duration: 3000
        });
        this.isLoading = false;
      }
    );
  }

  getRoomName(roomId: number): string {
    const room = this.rooms.find(r => r.id === roomId);
    return room ? room.name : 'Undefined';
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
  
  getStatusLabel(status: BookingStatus): string {
    return this.bookingStatusService.getStatusTranslationSync(status);
  }
  
  getStatusColor(status: BookingStatus): string {
    switch(status) {
      case BookingStatus.PENDING:
        return 'accent';
      case BookingStatus.CONFIRMED:
        return 'primary';
      case BookingStatus.CHECKED_IN:
        return 'primary';
      case BookingStatus.CHECKED_OUT:
        return 'primary';
      case BookingStatus.CANCELLED:
        return 'warn';
      default:
        return '';
    }
  }
}