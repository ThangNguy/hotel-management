import { Injectable } from '@angular/core';
import { BookingStatus } from '../../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingStatusService {
  constructor() { }

  getStatusLabel(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING:
        return 'Pending';
      case BookingStatus.CONFIRMED:
        return 'Confirmed';
      case BookingStatus.CHECKED_IN:
        return 'Checked In';
      case BookingStatus.CHECKED_OUT:
        return 'Checked Out';
      case BookingStatus.CANCELLED:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }
}