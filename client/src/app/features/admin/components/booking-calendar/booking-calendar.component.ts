import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { HotelService } from '../../../../core/services';
import { BookingStatusService } from '../../../../core/services/booking-status.service';
import { Booking, BookingStatus } from '../../../../models/booking.model';
import { Room } from '../../../../models/room.model';
import { BookingFormDialogComponent } from '../booking-form-dialog/booking-form-dialog.component';

interface StatusFilterOption {
  value: BookingStatus;
  label: string;
  color: string;
}

@Component({
  selector: 'app-booking-calendar',
  templateUrl: './booking-calendar.component.html',
  styleUrls: ['./booking-calendar.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FullCalendarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ]
})
export class BookingCalendarComponent implements OnInit {
  private _hotelService = inject(HotelService);
  private _dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _bookingStatusService = inject(BookingStatusService);

  // Using Signals (Angular 17+) following the rules in .editorconfig
  private _isLoading = signal(false);
  private _bookings = signal<Booking[]>([]);
  private _rooms = signal<Room[]>([]);
  private _calendarEvents = signal<any[]>([]);
  private _filteredEvents = signal<any[]>([]);
  private _selectedStatuses = signal<BookingStatus[]>(Object.values(BookingStatus));

  // Public getters
  get isLoading() { return this._isLoading(); }
  get bookings() { return this._bookings(); }
  get rooms() { return this._rooms(); }
  get calendarEvents() { return this._calendarEvents(); }
  get filteredEvents() { return this._filteredEvents(); }
  get selectedStatuses() { return this._selectedStatuses(); }

  // Status filter options
  allStatusOptions: StatusFilterOption[] = [];

  // FullCalendar options
  calendarOptions: CalendarOptions = {
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin
    ],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    initialView: 'dayGridMonth',
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this),
    locale: 'en-US',
    buttonText: {
      today: 'Today',
      month: 'Month',
      week: 'Week',
      day: 'Day'
    }
  };

  ngOnInit(): void {
    this.initStatusOptions();
    this.loadData();
  }
  
  initStatusOptions(): void {
    this.allStatusOptions = [
      { value: BookingStatus.PENDING, label: this._bookingStatusService.getStatusLabel(BookingStatus.PENDING), color: '#ffa726' },
      { value: BookingStatus.CONFIRMED, label: this._bookingStatusService.getStatusLabel(BookingStatus.CONFIRMED), color: '#42a5f5' },
      { value: BookingStatus.CHECKED_IN, label: this._bookingStatusService.getStatusLabel(BookingStatus.CHECKED_IN), color: '#66bb6a' },
      { value: BookingStatus.CHECKED_OUT, label: this._bookingStatusService.getStatusLabel(BookingStatus.CHECKED_OUT), color: '#78909c' },
      { value: BookingStatus.CANCELLED, label: this._bookingStatusService.getStatusLabel(BookingStatus.CANCELLED), color: '#ef5350' }
    ];
  }

  loadData(): void {
    this._isLoading.set(true);

    // Load rooms first
    this._hotelService.getRoomsAsync().subscribe({
      next: (rooms) => {
        this._rooms.set(rooms);

        // Then load bookings
        this._hotelService.getBookingsAsync().subscribe({
          next: (bookings) => {
            this._bookings.set(bookings);
            this.updateCalendarEvents(bookings);
            this._isLoading.set(false);
          },
          error: (error) => {
            this._snackBar.open('Error loading booking data', 'Close', {
              duration: 3000
            });
            this._isLoading.set(false);
          }
        });
      },
      error: (error) => {
        this._snackBar.open('Error loading room list', 'Close', {
          duration: 3000
        });
        this._isLoading.set(false);
      }
    });
  }

  updateCalendarEvents(bookings: Booking[]): void {
    const events = bookings.map(booking => {
      const room = this._rooms().find(r => r.id === booking.roomId);
      const roomName = room ? room.name : 'Unknown Room';
      
      // Determine color based on booking status
      let backgroundColor: string;
      switch(booking.status) {
        case BookingStatus.PENDING:
          backgroundColor = '#ffa726'; // Orange
          break;
        case BookingStatus.CONFIRMED:
          backgroundColor = '#42a5f5'; // Blue
          break;
        case BookingStatus.CHECKED_IN:
          backgroundColor = '#66bb6a'; // Green
          break;
        case BookingStatus.CHECKED_OUT:
          backgroundColor = '#78909c'; // Gray
          break;
        case BookingStatus.CANCELLED:
          backgroundColor = '#ef5350'; // Red
          break;
        default:
          backgroundColor = '#42a5f5'; // Default blue
      }
      
      return {
        id: booking.id.toString(),
        title: `${booking.guestName} - ${roomName}`,
        start: new Date(booking.checkInDate),
        end: new Date(booking.checkOutDate),
        backgroundColor: backgroundColor,
        borderColor: backgroundColor,
        extendedProps: {
          booking: booking,
          roomName: roomName,
          status: booking.status
        }
      };
    });
    
    this._calendarEvents.set(events);
    this.applyFilters();
  }

  // Apply filters to calendar events
  applyFilters(): void {
    const events = this._calendarEvents();
    const selectedStatuses = this._selectedStatuses();
    
    const filteredEvents = events.filter(event => 
      selectedStatuses.includes(event.extendedProps.status)
    );
    
    this._filteredEvents.set(filteredEvents);
    this.calendarOptions.events = filteredEvents;
  }

  // Handle status filter change
  onStatusFilterChange(event: any): void {
    this._selectedStatuses.set(event.value);
    this.applyFilters();
  }

  // Reset all filters
  resetFilters(): void {
    this._selectedStatuses.set(Object.values(BookingStatus));
    this.applyFilters();
  }

  // Handle when user selects a date range on the calendar
  handleDateSelect(selectInfo: DateSelectArg): void {
    const startDate = selectInfo.startStr;
    const endDate = selectInfo.endStr;
    
    // Create new booking with basic info
    const newBooking: Partial<Booking> = {
      checkInDate: startDate,
      checkOutDate: endDate,
      status: BookingStatus.PENDING
    };
    
    // Open dialog to create new booking
    this.openBookingDialog('add', newBooking as Booking);
  }

  // Handle when user clicks on an event
  handleEventClick(clickInfo: EventClickArg): void {
    const booking = clickInfo.event.extendedProps['booking'] as Booking;
    this.openBookingDialog('edit', booking);
  }

  // Handle when user drags and drops an event
  handleEventDrop(eventDropInfo: any): void {
    const booking = eventDropInfo.event.extendedProps['booking'] as Booking;
    const updatedBooking: Booking = {
      ...booking,
      checkInDate: eventDropInfo.event.start,
      checkOutDate: eventDropInfo.event.end || new Date(eventDropInfo.event.start.getTime() + 24 * 60 * 60 * 1000)
    };
    
    this.updateBooking(updatedBooking);
  }

  // Handle when user resizes an event
  handleEventResize(eventResizeInfo: any): void {
    const booking = eventResizeInfo.event.extendedProps['booking'] as Booking;
    const updatedBooking: Booking = {
      ...booking,
      checkInDate: eventResizeInfo.event.start,
      checkOutDate: eventResizeInfo.event.end
    };
    
    this.updateBooking(updatedBooking);
  }

  // Open booking dialog
  openBookingDialog(mode: 'add' | 'edit', booking: Booking): void {
    const dialogRef = this._dialog.open(BookingFormDialogComponent, {
      width: '700px',
      data: { mode: mode, booking: {...booking}, rooms: this._rooms() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (mode === 'add') {
          this.addBooking(result);
        } else {
          this.updateBooking(result);
        }
      }
    });
  }

  // Add new booking - updated to handle from the add button on interface
  addBooking(booking?: Booking): void {
    // If no booking is passed, open form with empty booking
    if (!booking || Object.keys(booking).length === 0) {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      
      const newBooking: Partial<Booking> = {
        checkInDate: today.toISOString(),
        checkOutDate: tomorrow.toISOString(),
        status: BookingStatus.PENDING
      };
      
      this.openBookingDialog('add', newBooking as Booking);
      return;
    }
    
    // If booking is passed, add to database
    this._isLoading.set(true);
    this._hotelService.addBooking(booking).subscribe({
      next: (newBooking) => {
        this._snackBar.open('Booking added successfully', 'Close', {
          duration: 3000
        });
        this.loadData();
      },
      error: (error) => {
        this._snackBar.open('Error adding booking', 'Close', {
          duration: 3000
        });
        this._isLoading.set(false);
      }
    });
  }

  // Update booking
  updateBooking(booking: Booking): void {
    this._isLoading.set(true);
    this._hotelService.updateBooking(booking).subscribe({
      next: (updatedBooking) => {
        this._snackBar.open('Booking updated successfully', 'Close', {
          duration: 3000
        });
        this.loadData();
      },
      error: (error) => {
        this._snackBar.open('Error updating booking', 'Close', {
          duration: 3000
        });
        this._isLoading.set(false);
      }
    });
  }
}