import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../material/material.module';
import { Room } from '../../models/room.model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { ErrorHandlingService } from '../../services/error-handling.service';
import { BookingStatus } from '../../models/booking.model';
import { LoadingIndicatorComponent } from '../shared/loading-indicator/loading-indicator.component';
import { MatTabsModule } from '@angular/material/tabs'; // Import MatTabsModule explicitly
import { ModelMapperService } from '../../core/services/model-mapper.service';

@Component({
  selector: 'app-room-detail-modal',
  standalone: true,
  imports: [
    CommonModule, 
    MaterialModule, 
    MatDialogModule, 
    ReactiveFormsModule, 
    LoadingIndicatorComponent,
    MatTabsModule // Add MatTabsModule explicitly
  ],
  templateUrl: './room-detail-modal.component.html',
  styleUrl: './room-detail-modal.component.scss'
})
export class RoomDetailModalComponent implements OnInit {
  bookingForm: FormGroup;
  activeTab = 0;
  isSubmitting = false;
  minDate = new Date();
  minCheckOutDate = new Date(this.minDate.getTime() + 86400000); // Tomorrow
  
  // Price calculation
  numberOfNights = 1;
  totalPrice = 0;

  constructor(
    public dialogRef: MatDialogRef<RoomDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public room: Room,
    private fb: FormBuilder,
    private hotelService: HotelService,
    private errorService: ErrorHandlingService
  ) {
    // Ensure all room properties are properly mapped
    this.room = ModelMapperService.mapRoom(room);
    
    // Use default max capacity if room.capacity is undefined
    const maxCapacity = this.room.capacity || this.room.maxOccupancy || 1;
    
    // Initialize booking form
    this.bookingForm = this.fb.group({
      checkInDate: [null, Validators.required],
      checkOutDate: [null, Validators.required],
      numberOfGuests: [1, [Validators.required, Validators.min(1), Validators.max(maxCapacity)]],
      guestName: ['', [Validators.required, Validators.minLength(3)]],
      guestEmail: ['', [Validators.required, Validators.email]],
      guestPhone: ['', [Validators.required, Validators.pattern(/^\d{10,11}$/)]],
      specialRequests: ['']
    });
  }

  ngOnInit(): void {
    // Update price calculation when form values change
    this.bookingForm.valueChanges.subscribe(() => {
      this.updatePriceCalculation();
    });
    
    // Update checkout min date when check-in date changes
    this.bookingForm.get('checkInDate')?.valueChanges.subscribe(date => {
      if (date) {
        const checkInDate = new Date(date);
        this.minCheckOutDate = new Date(checkInDate.getTime() + 86400000); // Next day
        
        // Reset checkout date if it's before the new min date
        const currentCheckOutDate = this.bookingForm.get('checkOutDate')?.value;
        if (currentCheckOutDate && new Date(currentCheckOutDate) < this.minCheckOutDate) {
          this.bookingForm.get('checkOutDate')?.setValue(null);
        } else {
          // Update price calculation for new date
          this.updatePriceCalculation();
        }
      }
    });
  }

  updatePriceCalculation(): void {
    const checkInDate = this.bookingForm.get('checkInDate')?.value;
    const checkOutDate = this.bookingForm.get('checkOutDate')?.value;
    
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      
      // Calculate number of nights
      const timeDiff = checkOut.getTime() - checkIn.getTime();
      this.numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      // Calculate total price (use pricePerNight as fallback)
      this.totalPrice = this.numberOfNights * (this.room.price || this.room.pricePerNight || 0);
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  submitBooking(): void {
    if (this.bookingForm.valid) {
      this.isSubmitting = true;
      
      const formValues = this.bookingForm.value;
      const booking = {
        roomId: this.room.id,
        checkInDate: formValues.checkInDate,
        checkOutDate: formValues.checkOutDate,
        numberOfGuests: formValues.numberOfGuests,
        guestName: formValues.guestName,
        guestEmail: formValues.guestEmail,
        guestPhone: formValues.guestPhone,
        specialRequests: formValues.specialRequests,
        totalPrice: this.totalPrice,
        status: BookingStatus.PENDING
      };
      
      this.hotelService.addBooking(booking).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.errorService.showSuccess('BOOKING_SUCCESS');
          this.dialogRef.close(true); // Pass true to indicate successful booking
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorService.handleError(error);
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      this.bookingForm.markAllAsTouched();
    }
  }

  // Hiển thị giá theo định dạng VND
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }
}
