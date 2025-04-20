import { Injectable } from '@angular/core';
import { BookingStatus } from '../models/booking.model';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BookingStatusTranslationService {

  constructor(private translate: TranslateService) { }

  // Get translated booking status
  getStatusTranslation(status: BookingStatus): Observable<string> {
    const translationKey = this.getTranslationKey(status);
    return this.translate.get(translationKey);
  }

  // Get translated booking status immediately
  getStatusTranslationSync(status: BookingStatus): string {
    const translationKey = this.getTranslationKey(status);
    return this.translate.instant(translationKey);
  }

  // Get all booking statuses with translations
  getAllStatusesWithTranslations(): Observable<{value: BookingStatus, label: string}[]> {
    const keys = Object.values(BookingStatus).map(status => this.getTranslationKey(status));
    
    return this.translate.get(keys).pipe(
      map(translations => {
        return Object.values(BookingStatus).map(status => ({
          value: status,
          label: translations[this.getTranslationKey(status)]
        }));
      })
    );
  }

  // Helper method to get translation key for a status
  private getTranslationKey(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING:
        return 'BOOKING_STATUS.PENDING';
      case BookingStatus.CONFIRMED:
        return 'BOOKING_STATUS.CONFIRMED';
      case BookingStatus.CHECKED_IN:
        return 'BOOKING_STATUS.CHECKED_IN';
      case BookingStatus.CHECKED_OUT:
        return 'BOOKING_STATUS.CHECKED_OUT';
      case BookingStatus.CANCELLED:
        return 'BOOKING_STATUS.CANCELLED';
      default:
        return 'BOOKING_STATUS.PENDING';
    }
  }

  getTranslatedStatus(status: BookingStatus): string {
    switch (status) {
      case BookingStatus.PENDING:
        return this.translate.instant('BOOKING_STATUS.PENDING');
      case BookingStatus.CONFIRMED:
        return this.translate.instant('BOOKING_STATUS.CONFIRMED');
      case BookingStatus.CHECKED_IN:
        return this.translate.instant('BOOKING_STATUS.CHECKED_IN');
      case BookingStatus.CHECKED_OUT:
        return this.translate.instant('BOOKING_STATUS.CHECKED_OUT');
      case BookingStatus.CANCELLED:
        return this.translate.instant('BOOKING_STATUS.CANCELLED');
      default:
        return status;
    }
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