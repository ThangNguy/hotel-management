import { Injectable } from '@angular/core';
import { Room } from '../models/room.model';
import { Booking, BookingStatus } from '../models/booking.model';
import { Observable, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpParams } from '@angular/common/http';
import { ApiConfigService } from './api-config.service';
import { RequestService } from './request.service';

/**
 * Service to manage hotel-related operations including rooms and bookings
 */
@Injectable({
  providedIn: 'root'
})
export class HotelService {
  // Cache keys
  private readonly ROOMS_CACHE_KEY = 'hotelRooms';
  private readonly BOOKINGS_CACHE_KEY = 'hotelBookings';

  constructor(
    private apiConfigService: ApiConfigService,
    private requestService: RequestService
  ) { }

  // ROOMS API
  /**
   * Get all rooms from the API
   * @returns Observable of rooms array
   */
  getRoomsAsync(): Observable<Room[]> {
    return this.requestService.get<Room[]>(this.apiConfigService.getRoomsUrl())
      .pipe(
        map(rooms => {
          // Transform and cache the data
          rooms.forEach(room => this.transformImageUrl(room));
          this.cacheRooms(rooms);
          return rooms;
        })
      );
  }

  /**
   * Get a room by its ID from the API
   * @param id Room ID
   * @returns Observable of the room or undefined
   */
  getRoomByIdAsync(id: number): Observable<Room | undefined> {
    return this.requestService.get<Room>(this.apiConfigService.getRoomUrl(id));
  }

  /**
   * Add a new room
   * @param room Room to add
   * @returns Observable of the created room
   */
  addRoom(room: Room): Observable<Room> {
    return this.requestService.post<Room>(this.apiConfigService.getRoomsUrl(), room);
  }

  /**
   * Update an existing room
   * @param room Room to update
   * @returns Observable of the updated room
   */
  updateRoom(room: Room): Observable<Room> {
    return this.requestService.put<Room>(this.apiConfigService.getRoomUrl(room.id), room);
  }

  /**
   * Delete a room
   * @param id Room ID to delete
   * @returns Observable of operation result
   */
  deleteRoom(id: number): Observable<boolean> {
    return this.requestService.delete<void>(this.apiConfigService.getRoomUrl(id))
      .pipe(
        map(() => true)
      );
  }

  /**
   * Get available rooms for a date range
   * @param checkIn Check-in date
   * @param checkOut Check-out date
   * @returns Observable of available rooms
   */
  getAvailableRoomsAsync(checkIn: Date, checkOut: Date): Observable<Room[]> {
    const params = new HttpParams()
      .set('checkInDate', checkIn.toISOString())
      .set('checkOutDate', checkOut.toISOString());

    return this.requestService.get<Room[]>(this.apiConfigService.getAvailableRoomsUrl(), params);
  }

  // BOOKINGS API
  /**
   * Get all bookings from the API
   * @returns Observable of bookings array
   */
  getBookingsAsync(): Observable<Booking[]> {
    return this.requestService.get<Booking[]>(this.apiConfigService.getBookingsUrl())
      .pipe(
        tap(bookings => this.cacheBookings(bookings))
      );
  }

  /**
   * Get a booking by ID from the API
   * @param id Booking ID
   * @returns Observable of the booking or undefined
   */
  getBookingByIdAsync(id: number): Observable<Booking | undefined> {
    return this.requestService.get<Booking>(this.apiConfigService.getBookingUrl(id));
  }

  /**
   * Create a new booking
   * @param booking Booking data
   * @returns Observable of the created booking
   */
  addBooking(booking: Partial<Booking>): Observable<Booking> {
    return this.requestService.post<Booking>(this.apiConfigService.getBookingsUrl(), booking);
  }

  /**
   * Update an existing booking
   * @param booking Booking to update
   * @returns Observable of the updated booking
   */
  updateBooking(booking: Booking): Observable<Booking> {
    return this.requestService.put<Booking>(this.apiConfigService.getBookingUrl(booking.id), booking);
  }

  /**
   * Update the status of a booking
   * @param id Booking ID
   * @param status New booking status
   * @returns Observable of the updated booking
   */
  updateBookingStatus(id: number, status: BookingStatus): Observable<Booking | undefined> {
    return this.requestService.patch<Booking>(this.apiConfigService.getBookingUrl(id), { status });
  }

  /**
   * Delete a booking
   * @param id Booking ID
   * @returns Observable of operation result
   */
  deleteBooking(id: number): Observable<boolean> {
    return this.requestService.delete<void>(this.apiConfigService.getBookingUrl(id))
      .pipe(
        map(() => true)
      );
  }

  /**
   * Get available room amenities
   * @returns Array of amenities in English
   */
  getAmenities(): string[] {
    return [
      'Wi-Fi',
      'Air Conditioning',
      'Flat Screen TV',
      'Minibar',
      'Safe',
      'Coffee Machine',
      'Marble Bathroom',
      'Bathtub',
      'Balcony',
      'Living Room',
      'Desk',
      'Dining Room',
      'Butler Service',
      'King Bed'
    ];
  }

  // SYNC METHODS - For compatibility with components that haven't been updated
  
  /**
   * Get rooms from cache
   * @returns Array of rooms
   */
  getRooms(): Room[] {
    const cachedData = this.getCachedRooms();
    if (cachedData) {
      return cachedData;
    }
    return [];
  }

  /**
   * Get a room by ID from cache
   * @param id Room ID
   * @returns Room object or undefined
   */
  getRoomById(id: number): Room | undefined {
    const cachedData = this.getCachedRooms();
    if (cachedData) {
      return cachedData.find(r => r.id === id);
    }
    return undefined;
  }

  /**
   * Get bookings from cache
   * @returns Array of bookings
   */
  getBookings(): Booking[] {
    return this.getCachedBookings() || [];
  }

  /**
   * Get a booking by ID from cache
   * @param id Booking ID
   * @returns Booking object or undefined
   */
  getBookingById(id: number): Booking | undefined {
    const cachedData = this.getCachedBookings();
    if (cachedData) {
      return cachedData.find(b => b.id === id);
    }
    return undefined;
  }

  /**
   * Check if a room is available for a date range
   * @param roomId Room ID
   * @param checkIn Check-in date
   * @param checkOut Check-out date
   * @returns Boolean indicating availability
   */
  checkRoomAvailability(roomId: number, checkIn: Date, checkOut: Date): boolean {
    const bookings = this.getBookings();
    
    const checkInTime = new Date(checkIn).getTime();
    const checkOutTime = new Date(checkOut).getTime();
  
    const roomBookings = bookings.filter(booking => 
      booking.roomId === roomId && 
      booking.status !== BookingStatus.CANCELLED
    );

    for (const booking of roomBookings) {
      const bookingCheckInTime = new Date(booking.checkInDate).getTime();
      const bookingCheckOutTime = new Date(booking.checkOutDate).getTime();

      if (
        (checkInTime >= bookingCheckInTime && checkInTime < bookingCheckOutTime) ||
        (checkOutTime > bookingCheckInTime && checkOutTime <= bookingCheckOutTime) ||
        (checkInTime <= bookingCheckInTime && checkOutTime >= bookingCheckOutTime)
      ) {
        return false;
      }
    }

    return true;
  }

  // PRIVATE HELPER METHODS

  /**
   * Transform image URLs to include base URL
   * @param room Room to transform
   * @returns Room with transformed image URLs
   */
  private transformImageUrl(room: Room): Room {
    if (room.images && room.images.length > 0) {
      room.images = room.images.map(image => 
        `${this.apiConfigService.baseUrl}/${image}`
      );
    }
    return room;
  }

  /**
   * Cache rooms data in session storage
   * @param rooms Rooms to cache
   */
  private cacheRooms(rooms: Room[]): void {
    window.sessionStorage.setItem(this.ROOMS_CACHE_KEY, JSON.stringify(rooms));
  }

  /**
   * Cache bookings data in session storage
   * @param bookings Bookings to cache
   */
  private cacheBookings(bookings: Booking[]): void {
    window.sessionStorage.setItem(this.BOOKINGS_CACHE_KEY, JSON.stringify(bookings));
  }

  /**
   * Get cached rooms data
   * @returns Array of rooms or null
   */
  private getCachedRooms(): Room[] | null {
    const cachedData = window.sessionStorage.getItem(this.ROOMS_CACHE_KEY);
    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {
        console.error('Error parsing cached rooms data', e);
      }
    }
    return null;
  }

  /**
   * Get cached bookings data
   * @returns Array of bookings or null
   */
  private getCachedBookings(): Booking[] | null {
    const cachedData = window.sessionStorage.getItem(this.BOOKINGS_CACHE_KEY);
    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {
        console.error('Error parsing cached bookings data', e);
      }
    }
    return null;
  }
}
