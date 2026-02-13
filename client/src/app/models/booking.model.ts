import { Form, FormControl } from "@angular/forms";

export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  CHECKED_IN = 'CheckedIn',
  CHECKED_OUT = 'CheckedOut',
  CANCELLED = 'Cancelled'
}

export interface Booking {
  id?: number;
  hotelId: number;
  roomId: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  specialRequests?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  // Additional fields for UI / Legacy compatibility
  roomName?: string;
  numberOfNights?: number;
  adults?: number;
  children?: number;
}

export interface BookingForm {
  id: FormControl<number | null>;
  roomId: FormControl<number | null>;
  guestName: FormControl<string | null>;
  guestEmail: FormControl<string | null>;
  guestPhone: FormControl<string | null>;
  checkInDate: FormControl<Date | null>;
  checkOutDate: FormControl<Date | null>;
  children: FormControl<number | null>;
  numberOfGuests: FormControl<number | null>;
  totalPrice: FormControl<number | null>;
  status: FormControl<BookingStatus | null>;
  specialRequests: FormControl<string | null>;
}