import { Injectable } from '@angular/core';
import { Room } from '../models/room.model';
import { Booking, BookingStatus } from '../models/booking.model';
import { Observable, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { HttpParams } from '@angular/common/http';
import { ApiConfigService } from '../services/api-config.service';
import { RequestService } from '../services/request.service';
import { ModelMapperService } from './model-mapper.service';

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
    private translateService: TranslateService,
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
        map((rooms: Room[]) => {
          // Transform and cache the data
          const mappedRooms = rooms.map(room => ModelMapperService.mapRoom(room));
          mappedRooms.forEach((room: Room) => this.transformImageUrl(room));
          this.cacheRooms(mappedRooms);
          return mappedRooms.map((room: Room) => this.translateRoom(room));
        })
      );
  }

  /**
   * Get a room by its ID from the API
   * @param id Room ID
   * @returns Observable of the room or undefined
   */
  getRoomByIdAsync(id: number): Observable<Room | undefined> {
    return this.requestService.get<Room>(this.apiConfigService.getRoomUrl(id))
      .pipe(
        map((room: Room) => this.translateRoom(ModelMapperService.mapRoom(room)))
      );
  }

  /**
   * Add a new room
   * @param room Room to add
   * @returns Observable of the created room
   */
  addRoom(room: Room): Observable<Room> {
    return this.requestService.post<Room>(this.apiConfigService.getRoomsUrl(), room)
      .pipe(
        map((newRoom: Room) => this.translateRoom(ModelMapperService.mapRoom(newRoom)))
      );
  }

  /**
   * Update an existing room
   * @param room Room to update
   * @returns Observable of the updated room
   */
  updateRoom(room: Room): Observable<Room> {
    return this.requestService.put<Room>(this.apiConfigService.getRoomUrl(room.id), room)
      .pipe(
        map((updatedRoom: Room) => this.translateRoom(ModelMapperService.mapRoom(updatedRoom)))
      );
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

    return this.requestService.get<Room[]>(this.apiConfigService.getAvailableRoomsUrl(), params)
      .pipe(
        map((rooms: Room[]) => rooms.map((room: Room) => this.translateRoom(room)))
      );
  }

  // BOOKINGS API
  /**
   * Get all bookings from the API
   * @returns Observable of bookings array
   */
  getBookingsAsync(): Observable<Booking[]> {
    return this.requestService.get<Booking[]>(this.apiConfigService.getBookingsUrl())
      .pipe(
        map((bookings: Booking[]) => bookings.map(booking => ModelMapperService.mapBooking(booking))),
        tap((bookings: Booking[]) => this.cacheBookings(bookings))
      );
  }

  /**
   * Get a booking by ID from the API
   * @param id Booking ID
   * @returns Observable of the booking or undefined
   */
  getBookingByIdAsync(id: number): Observable<Booking | undefined> {
    return this.requestService.get<Booking>(this.apiConfigService.getBookingUrl(id))
      .pipe(
        map((booking: Booking) => ModelMapperService.mapBooking(booking))
      );
  }

  /**
   * Create a new booking
   * @param booking Booking data
   * @returns Observable of the created booking
   */
  addBooking(booking: Partial<Booking>): Observable<Booking> {
    return this.requestService.post<Booking>(this.apiConfigService.getBookingsUrl(), booking)
      .pipe(
        map((newBooking: Booking) => ModelMapperService.mapBooking(newBooking))
      );
  }

  /**
   * Update an existing booking
   * @param booking Booking to update
   * @returns Observable of the updated booking
   */
  updateBooking(booking: Booking): Observable<Booking> {
    return this.requestService.put<Booking>(this.apiConfigService.getBookingUrl(booking.id), booking)
      .pipe(
        map((updatedBooking: Booking) => ModelMapperService.mapBooking(updatedBooking))
      );
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
   * @returns Array of amenity translation keys
   */
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

  // SYNC METHODS - For compatibility with components that haven't been updated
  
  /**
   * Get rooms from cache
   * @returns Array of rooms
   */
  getRooms(): Room[] {
    const cachedData = this.getCachedRooms();
    if (cachedData) {
      return cachedData.map((room: Room) => this.translateRoom(ModelMapperService.mapRoom(room)));
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
      const room = cachedData.find((r: Room) => r.id === id);
      return room ? this.translateRoom(ModelMapperService.mapRoom(room)) : undefined;
    }
    return undefined;
  }

  /**
   * Get bookings from cache
   * @returns Array of bookings
   */
  getBookings(): Booking[] {
    const cachedData = this.getCachedBookings();
    if (cachedData) {
      return cachedData.map((booking: Booking) => ModelMapperService.mapBooking(booking));
    }
    return [];
  }

  /**
   * Get a booking by ID from cache
   * @param id Booking ID
   * @returns Booking object or undefined
   */
  getBookingById(id: number): Booking | undefined {
    const cachedData = this.getCachedBookings();
    if (cachedData) {
      const booking = cachedData.find((b: Booking) => b.id === id);
      return booking ? ModelMapperService.mapBooking(booking) : undefined;
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
  
    const roomBookings = bookings.filter((booking: Booking) => 
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
   * Translate room data
   * @param room Room to translate
   * @returns Translated room
   */
  private translateRoom(room: Room): Room {
    if (!room) return room;
    
    const translatedRoom = { ...room };
    translatedRoom.name = this.translateService.instant(room.name);
    translatedRoom.description = this.translateService.instant(room.description);
    
    if (room.amenities && Array.isArray(room.amenities)) {
      translatedRoom.amenities = room.amenities.map((amenity: string) => 
        this.translateService.instant(amenity)
      );
    }
    
    return translatedRoom;
  }

  /**
   * Transform image URLs to include base URL
   * @param room Room to transform
   * @returns Room with transformed image URLs
   */
  private transformImageUrl(room: Room): Room {
    if (room.images && room.images.length > 0) {
      room.images = room.images.map((image: string) => 
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