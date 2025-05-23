import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BookingStatus, Booking } from '../../../../models/booking.model';
import { Room } from '../../../../models/room.model';
import { HotelService } from '../../../../core/services';
import { BookingStatusService } from '../../../../core/services/booking-status.service';


interface BookingFormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: number;
  totalPrice: number;
  specialRequests: string;
  status: BookingStatus;
}

@Component({
  selector: 'app-booking-form-dialog',
  templateUrl: './booking-form-dialog.component.html',
  styleUrls: ['./booking-form-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class BookingFormDialogComponent implements OnInit {
  bookingForm!: FormGroup;
  isEdit: boolean;
  minCheckOutDate!: Date;
  bookingStatuses = Object.values(BookingStatus);
  availableRooms: Room[] = [];
  minDate: Date | null = new Date();
  isRoomAvailable = true;
  
  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private bookingStatusService: BookingStatusService,
    public dialogRef: MatDialogRef<BookingFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      mode: 'add' | 'edit', 
      booking: Booking | null,
      rooms: Room[]
    }
  ) {
    this.isEdit = data.mode === 'edit';
    this.availableRooms = [...data.rooms];
  }

  ngOnInit(): void {
    this.initForm();
    this.setupDependentFormFields();
    this.setupInitialDates();
  }

  private initForm(): void {
    const booking = this.data.booking;
    
    this.bookingForm = this.createBookingForm(booking);
    
    if (this.isEdit) {
      this.minDate = null;
    }
  }
  
  private createBookingForm(booking: Booking | null): FormGroup {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.fb.group({
      guestName: [booking?.guestName || '', [Validators.required, Validators.minLength(3)]],
      guestEmail: [booking?.guestEmail || '', [Validators.required, Validators.email]],
      guestPhone: [booking?.guestPhone || '', [Validators.required, Validators.pattern(/^\d{9,11}$/)]],
      roomId: [booking?.roomId || '', [Validators.required]],
      checkInDate: [booking?.checkInDate || new Date(), [Validators.required]],
      checkOutDate: [booking?.checkOutDate || tomorrow, [Validators.required]],
      numberOfGuests: [booking?.numberOfGuests || 1, [Validators.required, Validators.min(1)]],
      totalPrice: [{value: booking?.totalPrice || 0, disabled: true}],
      specialRequests: [booking?.specialRequests || ''],
      status: [booking?.status || BookingStatus.PENDING]
    });
  }
  
  private setupInitialDates(): void {
    if (this.isEdit && this.data.booking) {
      this.minCheckOutDate = new Date(this.data.booking.checkInDate);
      this.minCheckOutDate.setDate(this.minCheckOutDate.getDate() + 1);
    } else {
      // Set min checkout date to tomorrow for new bookings
      this.minCheckOutDate = new Date();
      this.minCheckOutDate.setDate(this.minCheckOutDate.getDate() + 1);
    }
  }
  
  private setupDependentFormFields(): void {
    // Monitor check-in date changes
    this.bookingForm.get('checkInDate')?.valueChanges.subscribe(date => {
      this.updateCheckOutMinDate(date);
    });
    
    // Monitor check-out date and room changes for price calculation
    this.bookingForm.get('checkOutDate')?.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });
    
    this.bookingForm.get('roomId')?.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
      this.validateRoomCapacity();
    });
    
    this.bookingForm.get('numberOfGuests')?.valueChanges.subscribe(() => {
      this.validateRoomCapacity();
    });
  }
  
  updateCheckOutMinDate(date?: any): void {
    const checkInDate = date ? new Date(date) : new Date(this.bookingForm.get('checkInDate')?.value);
    this.minCheckOutDate = new Date(checkInDate);
    this.minCheckOutDate.setDate(checkInDate.getDate() + 1);
    
    const currentCheckOutDate = this.bookingForm.get('checkOutDate')?.value;
    if (currentCheckOutDate && new Date(currentCheckOutDate) <= checkInDate) {
      this.bookingForm.get('checkOutDate')?.setValue(this.minCheckOutDate);
    }
    
    this.calculateTotalPrice();
  }
  
  calculateTotalPrice(): void {
    const roomId = this.bookingForm.get('roomId')?.value;
    const checkInDate = this.bookingForm.get('checkInDate')?.value;
    const checkOutDate = this.bookingForm.get('checkOutDate')?.value;
    
    if (!roomId || !checkInDate || !checkOutDate) return;
    
    const room = this.getRoomById(parseInt(roomId));
    if (!room) return;
    
    const nights = this.calculateNightsBetweenDates(checkInDate, checkOutDate);
    if (nights <= 0) return;
    
    const totalPrice = (room.price || room.pricePerNight || 0) * nights;
    this.bookingForm.get('totalPrice')?.setValue(totalPrice);
  }
  
  private calculateNightsBetweenDates(start: Date, end: Date): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  }
  
  checkRoomAvailability(): boolean {
    const roomId = this.bookingForm.get('roomId')?.value;
    const checkInDate = new Date(this.bookingForm.get('checkInDate')?.value);
    const checkOutDate = new Date(this.bookingForm.get('checkOutDate')?.value);
    
    if (!roomId) return false;
    
    // If editing, exclude the current booking from availability check
    if (this.isEdit && this.data.booking && this.data.booking.roomId === parseInt(roomId)) {
      this.isRoomAvailable = true;
      return true;
    }
    
    const isAvailable = this.hotelService.checkRoomAvailability(parseInt(roomId), checkInDate, checkOutDate);
    this.isRoomAvailable = isAvailable;
    return isAvailable;
  }
  
  getRoomById(roomId: number): Room | undefined {
    return this.data.rooms.find(room => room.id === roomId);
  }
  
  onSubmit(): void {
    if (this.bookingForm.invalid) {
      this.markFormGroupTouched(this.bookingForm);
      return;
    }
    
    if (!this.checkRoomAvailability()) {
      alert('Room is not available for the selected dates');
      return;
    }
    
    const formValue = {...this.bookingForm.getRawValue()} as BookingFormData;
    const booking: Partial<Booking> = this.prepareBookingData(formValue);
    
    this.dialogRef.close(booking);
  }
  
  private prepareBookingData(formValue: BookingFormData): Partial<Booking> {
    const booking: Partial<Booking> = {
      ...formValue,
      roomId: parseInt(formValue.roomId)
    };
    
    // Add id and createdAt if editing existing booking
    if (this.isEdit && this.data.booking) {
      booking.id = this.data.booking.id;
      booking.createdAt = this.data.booking.createdAt;
    }
    
    return booking;
  }
  
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  getFormattedPrice(price: number): string {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }
  
  getStatusLabel(status: BookingStatus): string {
    return this.bookingStatusService.getStatusLabel(status);
  }
  
  validateRoomCapacity(): void {
    const roomId = this.bookingForm.get('roomId')?.value;
    const numberOfGuests = this.bookingForm.get('numberOfGuests')?.value;
    
    if (!roomId || !numberOfGuests) return;
    
    const room = this.getRoomById(parseInt(roomId));
    if (room && numberOfGuests > (room.capacity || room.maxOccupancy || 1)) {
      this.bookingForm.get('numberOfGuests')?.setErrors({ exceedsCapacity: true });
    }
  }
}