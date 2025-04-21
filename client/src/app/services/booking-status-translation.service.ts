import { Injectable } from '@angular/core';
import { BookingStatus } from '../models/booking.model';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingStatusTranslationService {

  constructor() { }

  // Get booking status text as Observable
  getStatusTranslation(status: BookingStatus): Observable<string> {
    return of(this.getStatusText(status));
  }

  // Get booking status text immediately
  getStatusTranslationSync(status: BookingStatus): string {
    return this.getStatusText(status);
  }

  // Get all booking statuses with text
  getAllStatusesWithTranslations(): Observable<{value: BookingStatus, label: string}[]> {
    return of(
      Object.values(BookingStatus).map(status => ({
        value: status,
        label: this.getStatusText(status)
      }))
    );
  }

  // Helper method to get English text for a status
  private getStatusText(status: BookingStatus): string {
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
        return 'Pending';
    }
  }

  getTranslatedStatus(status: BookingStatus): string {
    return this.getStatusText(status);
  }

  getStatusColor(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING:
        return 'orange';
      case BookingStatus.CONFIRMED:
        return 'blue';
      case BookingStatus.CHECKED_IN:
        return 'green';
      case BookingStatus.CHECKED_OUT:
        return 'purple';
      case BookingStatus.CANCELLED:
        return 'red';
      default:
        return 'gray';
    }
  }
}