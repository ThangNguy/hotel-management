import { Component, OnInit, ViewChild, inject, signal, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';

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
import { DeleteConfirmDialogComponent } from '../delete-confirm-dialog/delete-confirm-dialog.component';


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
    MatProgressSpinnerModule,
    MatInputModule,
    MatDatepickerModule,
    MatDialogModule
  ]
})
export class BookingCalendarComponent implements OnInit {
  private _hotelService = inject(HotelService);
  private _dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private _bookingStatusService = inject(BookingStatusService);
  private _formBuilder = inject(FormBuilder);

  // Using Signals (Angular 17+) following the rules in .editorconfig
  private _isLoading = signal(false);
  private _bookings = signal<Booking[]>([]);
  private _rooms = signal<Room[]>([]);
  private _calendarEvents = signal<any[]>([]);
  private _filteredEvents = signal<any[]>([]);
  private _selectedStatuses = signal<BookingStatus[]>(Object.values(BookingStatus));
  private _isEditMode = signal(false);
  
  // Thêm biến để reference đến calendar
  @ViewChild('calendar') calendarComponent: any;
  @ViewChild('bookingDialog') bookingDialogTemplate!: TemplateRef<any>;

  // Form related properties
  bookingForm!: FormGroup;
  bookingStatusList = Object.values(BookingStatus);
  currentBooking: Booking | null = null;

  // Public getters
  get isLoading() { return this._isLoading(); }
  get bookings() { return this._bookings(); }
  get rooms() { return this._rooms(); }
  get calendarEvents() { return this._calendarEvents(); }
  get filteredEvents() { return this._filteredEvents(); }
  get selectedStatuses() { return this._selectedStatuses(); }
  get isEditMode() { return this._isEditMode(); }

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
    },
    events: [] // Initialize with empty array to be populated later
  };

  ngOnInit(): void {
    this.initStatusOptions();
    this.initBookingForm();
    this.loadData();
  }

  // Initialize the booking form
  initBookingForm(booking?: Partial<Booking>): void {
    this.bookingForm = this._formBuilder.group({
      id: [booking?.id || null],
      guestName: [booking?.guestName || '', Validators.required],
      email: [booking?.email || '', [Validators.required, Validators.email]],
      phone: [booking?.phone || ''],
      checkIn: [booking?.checkInDate ? new Date(booking.checkInDate) : new Date(), Validators.required],
      checkOut: [booking?.checkOutDate ? new Date(booking.checkOutDate) : new Date(Date.now() + 24 * 60 * 60 * 1000), Validators.required],
      roomId: [booking?.roomId || null, Validators.required],
      status: [booking?.status || BookingStatus.PENDING, Validators.required],
      specialRequests: [booking?.specialRequests || '']
    });
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
    // Log bookings for debugging
    console.log('Updating calendar events with bookings:', bookings);
    
    const events = bookings.map(booking => {
      const room = this._rooms().find(r => r.id === booking.roomId);
      const roomName = room ? room.name : 'Unknown Room';
      
      // Determine color based on booking status
      let backgroundColor = this.getStatusColor(booking.status);
      
      // Ensure dates are properly created as Date objects
      const startDate = new Date(booking.checkInDate);
      const endDate = new Date(booking.checkOutDate);
      
      console.log(`Processing booking: ${booking.id}, ${booking.guestName}, Check-in: ${startDate.toISOString()}, Check-out: ${endDate.toISOString()}`);
      
      return {
        id: booking.id.toString(),
        title: `${booking.guestName} - ${roomName}`,
        start: startDate,
        end: endDate,
        backgroundColor: backgroundColor,
        borderColor: backgroundColor,
        allDay: true, // Ensure events are displayed as all-day events
        extendedProps: {
          booking: booking,
          roomName: roomName,
          status: booking.status
        }
      };
    });
    
    console.log('Generated calendar events:', events);
    
    this._calendarEvents.set(events);
    
    // Update calendarOptions directly
    this.calendarOptions.events = events;
    
    // Force calendar to redraw with events using the API if available
    setTimeout(() => {
      if (this.calendarComponent && this.calendarComponent.getApi) {
        const calendarApi = this.calendarComponent.getApi();
        console.log('Calendar API found, forcing redraw');
        calendarApi.removeAllEvents();
        calendarApi.addEventSource(events);
        calendarApi.render();
      } else {
        console.log('Calendar API not available yet');
      }
    }, 0);
  }

  // Apply filters to calendar events
  applyFilters(): void {
    if (!this._bookings) return;
    
    const filteredEvents = this._calendarEvents().filter(event => {
      // If no status filters are selected, show all events
      if (this.selectedStatuses.length === 0) return true;
      
      // Otherwise, only show events that match the selected statuses
      return this.selectedStatuses.includes(event.extendedProps?.status);
    });
    
    // Update the calendar events directly via the calendar API if available
    if (this.calendarComponent && this.calendarComponent.getApi) {
      const calendarApi = this.calendarComponent.getApi();
      
      // Remove all events first
      calendarApi.removeAllEvents();
      
      // Then add the filtered events
      calendarApi.addEventSource(filteredEvents);
      
      // Render the events immediately
      calendarApi.render();
    }
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

  // Get color for booking status
  getStatusColor(status: BookingStatus): string {
    const statusOption = this.allStatusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : '#757575'; // Default color if not found
  }

  // Add new booking via dialog
  addBooking(): void {
    const newBooking: Partial<Booking> = {
      checkInDate: new Date().toISOString(),
      checkOutDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: BookingStatus.PENDING
    };
    this.openBookingDialog('add', newBooking as Booking);
  }

  // Open booking dialog for add or edit
  openBookingDialog(mode: 'add' | 'edit', booking: Booking): void {
    this._isEditMode.set(mode === 'edit');
    this.currentBooking = booking;
    
    this.initBookingForm(booking);
    
    const dialogRef = this._dialog.open(this.bookingDialogTemplate, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      // Dialog was closed without action
      if (!result) return;
      
      // Handle result if needed
    });
  }

  // Get available rooms for booking
  availableRooms() {
    return this._rooms();
  }

  // Save booking (add or update)
  saveBooking(): void {
    if (this.bookingForm.invalid) return;
    
    const formValues = this.bookingForm.value;
    
    // Convert dates to ISO string format
    const bookingData: Booking = {
      ...this.currentBooking,
      ...formValues,
      checkInDate: formValues.checkIn.toISOString(),
      checkOutDate: formValues.checkOut.toISOString(),
    };
    
    // Remove form-specific properties
    delete (bookingData as any).checkIn;
    delete (bookingData as any).checkOut;
    
    if (this.isEditMode) {
      this.updateBooking(bookingData);
    } else {
      this.createBooking(bookingData);
    }
    
    // Close the dialog
    this._dialog.closeAll();
  }

  // Create a new booking
  createBooking(booking: Booking): void {
    this._isLoading.set(true);
    
    this._hotelService.addBooking(booking).subscribe({
      next: (result) => {
        this._snackBar.open('Booking created successfully', 'Close', {
          duration: 3000
        });
        this.loadData(); // Reload all data to refresh the calendar
      },
      error: (error) => {
        this._snackBar.open('Error creating booking', 'Close', {
          duration: 3000
        });
        this._isLoading.set(false);
      }
    });
  }

  // Update an existing booking
  updateBooking(booking: Booking): void {
    this._isLoading.set(true);
    
    this._hotelService.updateBooking(booking).subscribe({
      next: (result) => {
        this._snackBar.open('Booking updated successfully', 'Close', {
          duration: 3000
        });
        this.loadData(); // Reload all data to refresh the calendar
      },
      error: (error) => {
        this._snackBar.open('Error updating booking', 'Close', {
          duration: 3000
        });
        this._isLoading.set(false);
      }
    });
  }

  // Delete an existing booking
  deleteBooking(): void {
    if (!this.currentBooking || !this.currentBooking.id) return;
    
    // Use the DeleteConfirmDialogComponent for confirmation instead of the browser's confirm
    const dialogRef = this._dialog.open(DeleteConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Booking',
        message: `Are you sure you want to delete this booking for "${this.currentBooking.guestName}"?`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._isLoading.set(true);
        
        this._hotelService.deleteBooking(this.currentBooking!.id).subscribe({
          next: () => {
            this._snackBar.open('Booking deleted successfully', 'Close', {
              duration: 3000
            });
            this._dialog.closeAll();
            this.loadData(); // Reload all data to refresh the calendar
          },
          error: (error) => {
            console.error('Error deleting booking:', error);
            this._snackBar.open('Failed to delete booking. Please try again.', 'Close', {
              duration: 5000
            });
          },
          complete: () => {
            this._isLoading.set(false);
          }
        });
      }
    });
  }
}