import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Booking, BookingStatus } from '../../../models/booking.model';
import { Room } from '../../../models/room.model';
import { HotelService } from '../../../services/hotel.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { BookingStatusTranslationService } from '../../../services/booking-status-translation.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule,
    TranslateModule
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
    private translate: TranslateService,
    private bookingStatusService: BookingStatusTranslationService,
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
    
    if (this.isEdit && this.data.booking) {
      this.minCheckOutDate = new Date(this.data.booking.checkInDate);
      this.minCheckOutDate.setDate(this.minCheckOutDate.getDate() + 1);
    }
    
    // Monitor check-in date changes to update check-out date min value
    this.bookingForm.get('checkInDate')?.valueChanges.subscribe(date => {
      const checkInDate = new Date(date);
      this.minCheckOutDate = new Date(checkInDate);
      this.minCheckOutDate.setDate(checkInDate.getDate() + 1);
      
      const currentCheckOutDate = this.bookingForm.get('checkOutDate')?.value;
      if (currentCheckOutDate && new Date(currentCheckOutDate) <= checkInDate) {
        this.bookingForm.get('checkOutDate')?.setValue(this.minCheckOutDate);
      }
      
      this.calculateTotalPrice();
    });
    
    // Monitor check-out date changes to update total price
    this.bookingForm.get('checkOutDate')?.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });
    
    // Monitor room changes to update total price
    this.bookingForm.get('roomId')?.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });
  }

  // Thêm phương thức này vì được sử dụng trong template
  updateCheckOutMinDate(): void {
    const checkInDate = new Date(this.bookingForm.get('checkInDate')?.value);
    this.minCheckOutDate = new Date(checkInDate);
    this.minCheckOutDate.setDate(checkInDate.getDate() + 1);
    
    const currentCheckOutDate = new Date(this.bookingForm.get('checkOutDate')?.value);
    if (currentCheckOutDate <= checkInDate) {
      this.bookingForm.get('checkOutDate')?.setValue(this.minCheckOutDate);
    }
    
    this.calculateTotalPrice();
  }

  initForm(): void {
    const booking = this.data.booking;
    
    this.bookingForm = this.fb.group({
      guestName: [booking?.guestName || '', [Validators.required, Validators.minLength(3)]],
      guestEmail: [booking?.guestEmail || '', [Validators.required, Validators.email]],
      guestPhone: [booking?.guestPhone || '', [Validators.required, Validators.pattern(/^\d{9,11}$/)]],
      roomId: [booking?.roomId || '', [Validators.required]],
      checkInDate: [booking?.checkInDate || new Date(), [Validators.required]],
      checkOutDate: [booking?.checkOutDate || new Date(new Date().setDate(new Date().getDate() + 1)), [Validators.required]],
      numberOfGuests: [booking?.numberOfGuests || 1, [Validators.required, Validators.min(1)]],
      totalPrice: [{value: booking?.totalPrice || 0, disabled: true}],
      specialRequests: [booking?.specialRequests || ''],
      status: [booking?.status || BookingStatus.PENDING]
    });
    
    if (this.isEdit) {
      this.minDate = null;
    }
  }
  
  calculateTotalPrice(): void {
    const roomId = this.bookingForm.get('roomId')?.value;
    const checkInDate = this.bookingForm.get('checkInDate')?.value;
    const checkOutDate = this.bookingForm.get('checkOutDate')?.value;
    
    if (roomId && checkInDate && checkOutDate) {
      const room = this.data.rooms.find(r => r.id === parseInt(roomId));
      if (room) {
        const start = new Date(checkInDate);
        const end = new Date(checkOutDate);
        const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        if (nights > 0) {
          const totalPrice = room.price * nights;
          this.bookingForm.get('totalPrice')?.setValue(totalPrice);
        }
      }
    }
  }
  
  checkRoomAvailability(): boolean {
    const roomId = this.bookingForm.get('roomId')?.value;
    const checkInDate = new Date(this.bookingForm.get('checkInDate')?.value);
    const checkOutDate = new Date(this.bookingForm.get('checkOutDate')?.value);
    
    // If editing, we need to exclude the current booking from availability check
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
      return;
    }
    
    if (!this.checkRoomAvailability()) {
      // Use translate service for alerts
      this.translate.get('BOOKING.ROOM_NOT_AVAILABLE').subscribe(msg => {
        alert(msg);
      });
      return;
    }
    
    const formValue = {...this.bookingForm.getRawValue()};
    
    const booking: Partial<Booking> = {
      ...formValue,
      roomId: parseInt(formValue.roomId)
    };
    
    if (this.isEdit && this.data.booking) {
      booking.id = this.data.booking.id;
      booking.createdAt = this.data.booking.createdAt;
    }
    
    this.dialogRef.close(booking);
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
  
  getFormattedPrice(price: number): string {
    return new Intl.NumberFormat(this.translate.currentLang === 'en' ? 'en-US' : 'vi-VN', { 
      style: 'currency', 
      currency: this.translate.currentLang === 'en' ? 'USD' : 'VND',
      minimumFractionDigits: 0
    }).format(price);
  }
  
  getStatusLabel(status: BookingStatus): string {
    return this.bookingStatusService.getStatusTranslationSync(status);
  }
  
  validateRoomCapacity() {
    const roomId = this.bookingForm.get('roomId')?.value;
    const numberOfGuests = this.bookingForm.get('numberOfGuests')?.value;
    
    if (roomId && numberOfGuests) {
      const room = this.getRoomById(parseInt(roomId));
      if (room && numberOfGuests > room.capacity) {
        this.bookingForm.get('numberOfGuests')?.setErrors({ exceedsCapacity: true });
      }
    }
  }
}