import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MaterialModule } from '../../../../material/material.module';
import { Booking } from '../../../../models/booking.model';
import { HotelService } from '../../../../core/services';
import { Room } from '../../../../models/room.model';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterLink],
  templateUrl: './booking-confirmation.component.html',
  styleUrls: ['./booking-confirmation.component.scss']
})
export class BookingConfirmationComponent implements OnInit {
  booking: Booking | null = null;
  room: Room | null = null;

  constructor(
    private router: Router,
    private hotelService: HotelService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.booking = navigation.extras.state['booking'];
    }
  }

  ngOnInit(): void {
    if (!this.booking) {
      // If no booking in state, redirect home
      this.router.navigate(['/home']);
      return;
    }

    // Load room details if we have the booking
    if (this.booking.roomId) {
      this.room = this.hotelService.getRoomById(this.booking.roomId) || null;
    }
  }

  getFormattedDate(date: any): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  }

  getFormattedPrice(price: number | undefined): string {
    if (price === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  }
}
