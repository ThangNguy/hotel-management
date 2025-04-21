import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HotelService } from '../../../services/hotel.service';
import { Room } from '../../../models/room.model';
import { RoomFormDialogComponent } from '../room-form-dialog/room-form-dialog.component';
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'app-admin-rooms',
  templateUrl: './admin-rooms.component.html',
  styleUrls: ['./admin-rooms.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ]
})
export class AdminRoomsComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'price', 'capacity', 'size', 'amenities', 'actions'];
  dataSource!: MatTableDataSource<Room>;
  rooms: Room[] = [];
  isLoading = false;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private hotelService: HotelService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadRooms();
  }
  
  loadRooms(): void {
    this.isLoading = true;
    this.hotelService.getRoomsAsync().subscribe(
      rooms => {
        this.rooms = rooms;
        this.dataSource = new MatTableDataSource(rooms);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.isLoading = false;
      },
      error => {
        this.snackBar.open('Error loading rooms', 'Close', {
          duration: 3000
        });
        this.isLoading = false;
      }
    );
  }
  
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  addRoom(): void {
    const dialogRef = this.dialog.open(RoomFormDialogComponent, {
      width: '650px',
      data: { mode: 'add', room: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.hotelService.addRoom(result).subscribe(
          newRoom => {
            this.snackBar.open('Room added successfully', 'Close', {
              duration: 3000
            });
            this.loadRooms();
          },
          error => {
            this.snackBar.open('Error adding room', 'Close', {
              duration: 3000
            });
            this.isLoading = false;
          }
        );
      }
    });
  }
  
  editRoom(room: Room): void {
    const dialogRef = this.dialog.open(RoomFormDialogComponent, {
      width: '650px',
      data: { mode: 'edit', room: {...room} }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.hotelService.updateRoom(result).subscribe(
          updatedRoom => {
            this.snackBar.open('Room updated successfully', 'Close', {
              duration: 3000
            });
            this.loadRooms();
          },
          error => {
            this.snackBar.open('Error updating room', 'Close', {
              duration: 3000
            });
            this.isLoading = false;
          }
        );
      }
    });
  }
  
  deleteRoom(room: Room): void {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Room',
        message: 'Are you sure you want to delete this room?'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.hotelService.deleteRoom(room.id).subscribe(
          success => {
            if (success) {
              this.snackBar.open('Room deleted successfully', 'Close', {
                duration: 3000
              });
              this.loadRooms();
            } else {
              this.snackBar.open('Error deleting room', 'Close', {
                duration: 3000
              });
              this.isLoading = false;
            }
          },
          error => {
            this.snackBar.open('Error deleting room', 'Close', {
              duration: 3000
            });
            this.isLoading = false;
          }
        );
      }
    });
  }
  
  getFormattedPrice(price: number): string {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }

  getAmenitiesDisplay(amenities: string[]): string {
    if (!amenities || amenities.length === 0) {
      return 'None';
    }
    
    if (amenities.length <= 3) {
      return amenities.join(', ');
    }
    
    return `${amenities.slice(0, 3).join(', ')} +${amenities.length - 3}`;
  }
}