import { Injectable } from '@angular/core';
import { Room } from '../models/room.model';
import { Booking, BookingStatus } from '../models/booking.model';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  constructor(
    private translate: TranslateService,
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) { }

  // TRANSLATION HELPER
  private translateRoom(room: Room): Room {
    const translatedRoom = { ...room };
    translatedRoom.name = this.translate.instant(room.name);
    translatedRoom.description = this.translate.instant(room.description);
    translatedRoom.amenities = room.amenities.map(amenity => this.translate.instant(amenity));
    return translatedRoom;
  }

  // SYNC METHODS FOR BACKWARD COMPATIBILITY
  // These methods are for compatibility with components that haven't been updated yet
  getRooms(): Room[] {
    // Return cached data or fetch and cache
    const cachedData = window.sessionStorage.getItem('hotelRooms');
    if (cachedData) {
      try {
        const rooms = JSON.parse(cachedData);
        return rooms.map((room: Room) => this.translateRoom(room));
      } catch (e) {
        console.error('Error parsing cached rooms data', e);
      }
    }
    
    // Return empty array and let the component handle async loading if needed
    return [];
  }

  getRoomById(id: number): Room | undefined {
    // Return from cached data if available
    const cachedData = window.sessionStorage.getItem('hotelRooms');
    if (cachedData) {
      try {
        const rooms = JSON.parse(cachedData);
        const room = rooms.find((r: Room) => r.id === id);
        return room ? this.translateRoom(room) : undefined;
      } catch (e) {
        console.error('Error parsing cached rooms data', e);
      }
    }
    
    return undefined;
  }

  getBookings(): Booking[] {
    // Return cached data or fetch and cache
    const cachedData = window.sessionStorage.getItem('hotelBookings');
    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {
        console.error('Error parsing cached bookings data', e);
      }
    }
    
    // Return empty array and let the component handle async loading if needed
    return [];
  }

  getBookingById(id: number): Booking | undefined {
    // Return from cached data if available
    const cachedData = window.sessionStorage.getItem('hotelBookings');
    if (cachedData) {
      try {
        const bookings = JSON.parse(cachedData);
        return bookings.find((b: Booking) => b.id === id);
      } catch (e) {
        console.error('Error parsing cached bookings data', e);
      }
    }
    
    return undefined;
  }

  checkRoomAvailability(roomId: number, checkIn: Date, checkOut: Date): boolean {
    // Simple implementation that checks cached bookings
    const bookings = this.getBookings();
    
    // Convert dates to timestamps for easier comparison
    const checkInTime = new Date(checkIn).getTime();
    const checkOutTime = new Date(checkOut).getTime();
  
    // Find bookings for the specific room
    const roomBookings = bookings.filter(booking => 
      booking.roomId === roomId && 
      booking.status !== BookingStatus.CANCELLED
    );

    // Check if any booking overlaps with the requested dates
    for (const booking of roomBookings) {
      const bookingCheckInTime = new Date(booking.checkInDate).getTime();
      const bookingCheckOutTime = new Date(booking.checkOutDate).getTime();

      // Check for overlap
      if (
        (checkInTime >= bookingCheckInTime && checkInTime < bookingCheckOutTime) ||
        (checkOutTime > bookingCheckInTime && checkOutTime <= bookingCheckOutTime) ||
        (checkInTime <= bookingCheckInTime && checkOutTime >= bookingCheckOutTime)
      ) {
        return false; // Overlap found, room is not available
      }
    }

    return true; // No overlap, room is available
  }

  getAmenities(): string[] {
    return [
      'ROOM_AMENITIES_LIST.WIFI',
      'ROOM_AMENITIES_LIST.AIR_CONDITIONING',
      'ROOM_AMENITIES_LIST.FLAT_SCREEN_TV',
      'ROOM_AMENITIES_LIST.MINIBAR',
      'ROOM_AMENITIES_LIST.SAFE',
      'ROOM_AMENITIES_LIST.COFFEE_MACHINE',
      'ROOM_AMENITIES_LIST.MARBLE_BATHROOM',
      'ROOM_AMENITIES_LIST.BATHTUB',
      'ROOM_AMENITIES_LIST.BALCONY',
      'ROOM_AMENITIES_LIST.LIVING_ROOM',
      'ROOM_AMENITIES_LIST.DESK',
      'ROOM_AMENITIES_LIST.DINING_ROOM',
      'ROOM_AMENITIES_LIST.BUTLER',
      'ROOM_AMENITIES_LIST.KING_BED'
    ];
  }

  // ROOMS API
  getRoomsAsync(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiConfig.getRoomsUrl())
      .pipe(
        map(rooms => {
          // Cache the data
          window.sessionStorage.setItem('hotelRooms', JSON.stringify(rooms));
          return rooms.map(room => this.translateRoom(room));
        }),
        catchError(error => {
          console.error('Error fetching rooms', error);
          return throwError(() => new Error('Failed to fetch rooms. Please try again.'));
        })
      );
  }

  getRoomByIdAsync(id: number): Observable<Room | undefined> {
    return this.http.get<Room>(this.apiConfig.getRoomUrl(id))
      .pipe(
        map(room => this.translateRoom(room)),
        catchError(error => {
          console.error(`Error fetching room with id ${id}`, error);
          return throwError(() => new Error('Failed to fetch room details. Please try again.'));
        })
      );
  }

  addRoom(room: Room): Observable<Room> {
    return this.http.post<Room>(this.apiConfig.getRoomsUrl(), room)
      .pipe(
        map(newRoom => this.translateRoom(newRoom)),
        catchError(error => {
          console.error('Error adding room', error);
          return throwError(() => new Error('Failed to add room. Please try again.'));
        })
      );
  }

  updateRoom(room: Room): Observable<Room> {
    return this.http.put<Room>(this.apiConfig.getRoomUrl(room.id), room)
      .pipe(
        map(updatedRoom => this.translateRoom(updatedRoom)),
        catchError(error => {
          console.error(`Error updating room with id ${room.id}`, error);
          return throwError(() => new Error('Failed to update room. Please try again.'));
        })
      );
  }

  deleteRoom(id: number): Observable<boolean> {
    return this.http.delete<void>(this.apiConfig.getRoomUrl(id))
      .pipe(
        map(() => true),
        catchError(error => {
          console.error(`Error deleting room with id ${id}`, error);
          return throwError(() => new Error('Failed to delete room. Please try again.'));
        })
      );
  }

  // ROOM AVAILABILITY
  getAvailableRoomsAsync(checkIn: Date, checkOut: Date): Observable<Room[]> {
    let params = new HttpParams()
      .set('checkInDate', checkIn.toISOString())
      .set('checkOutDate', checkOut.toISOString());

    return this.http.get<Room[]>(this.apiConfig.getAvailableRoomsUrl(), { params })
      .pipe(
        map(rooms => rooms.map(room => this.translateRoom(room))),
        catchError(error => {
          console.error('Error fetching available rooms', error);
          return throwError(() => new Error('Failed to fetch available rooms. Please try again.'));
        })
      );
  }

  // BOOKINGS API
  getBookingsAsync(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiConfig.getBookingsUrl())
      .pipe(
        catchError(error => {
          console.error('Error fetching bookings', error);
          return throwError(() => new Error('Failed to fetch bookings. Please try again.'));
        })
      );
  }

  getBookingByIdAsync(id: number): Observable<Booking | undefined> {
    return this.http.get<Booking>(this.apiConfig.getBookingUrl(id))
      .pipe(
        catchError(error => {
          console.error(`Error fetching booking with id ${id}`, error);
          return throwError(() => new Error('Failed to fetch booking details. Please try again.'));
        })
      );
  }

  addBooking(booking: Partial<Booking>): Observable<Booking> {
    return this.http.post<Booking>(this.apiConfig.getBookingsUrl(), booking)
      .pipe(
        catchError(error => {
          console.error('Error adding booking', error);
          return throwError(() => new Error('Failed to add booking. Please try again.'));
        })
      );
  }

  updateBooking(booking: Booking): Observable<Booking> {
    return this.http.put<Booking>(this.apiConfig.getBookingUrl(booking.id), booking)
      .pipe(
        catchError(error => {
          console.error(`Error updating booking with id ${booking.id}`, error);
          return throwError(() => new Error('Failed to update booking. Please try again.'));
        })
      );
  }

  updateBookingStatus(id: number, status: BookingStatus): Observable<Booking | undefined> {
    return this.http.patch<Booking>(this.apiConfig.getBookingUrl(id), { status })
      .pipe(
        catchError(error => {
          console.error(`Error updating booking status for id ${id}`, error);
          return throwError(() => new Error('Failed to update booking status. Please try again.'));
        })
      );
  }

  deleteBooking(id: number): Observable<boolean> {
    return this.http.delete<void>(this.apiConfig.getBookingUrl(id))
      .pipe(
        map(() => true),
        catchError(error => {
          console.error(`Error deleting booking with id ${id}`, error);
          return throwError(() => new Error('Failed to delete booking. Please try again.'));
        })
      );
  }
}
