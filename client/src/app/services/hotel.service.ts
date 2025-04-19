import { Injectable } from '@angular/core';
import { Room } from '../models/room.model';
import { Booking, BookingStatus } from '../models/booking.model';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  // In-memory data store
  private rooms: Room[] = [
    {
      id: 1,
      name: 'ROOM_TYPES.DELUXE_SINGLE',
      description: 'ROOM_DESCRIPTIONS.DELUXE_SINGLE',
      price: 1200000,
      capacity: 2,
      size: 28,
      beds: '1 King',
      images: ['assets/images/rooms/deluxe-single.jpg'],
      amenities: [
        'ROOM_AMENITIES_LIST.WIFI',
        'ROOM_AMENITIES_LIST.AIR_CONDITIONING',
        'ROOM_AMENITIES_LIST.FLAT_SCREEN_TV',
        'ROOM_AMENITIES_LIST.MINIBAR',
        'ROOM_AMENITIES_LIST.SAFE',
        'ROOM_AMENITIES_LIST.DESK'
      ],
      available: true
    },
    {
      id: 2,
      name: 'ROOM_TYPES.PREMIER',
      description: 'ROOM_DESCRIPTIONS.PREMIER',
      price: 1800000,
      capacity: 2,
      size: 35,
      beds: '1 King',
      images: ['assets/images/rooms/premier.jpg'],
      amenities: [
        'ROOM_AMENITIES_LIST.WIFI',
        'ROOM_AMENITIES_LIST.AIR_CONDITIONING',
        'ROOM_AMENITIES_LIST.FLAT_SCREEN_TV',
        'ROOM_AMENITIES_LIST.MINIBAR',
        'ROOM_AMENITIES_LIST.SAFE',
        'ROOM_AMENITIES_LIST.COFFEE_MACHINE',
        'ROOM_AMENITIES_LIST.BATHTUB',
        'ROOM_AMENITIES_LIST.BALCONY',
        'ROOM_AMENITIES_LIST.DESK'
      ],
      available: true
    },
    {
      id: 3,
      name: 'ROOM_TYPES.FAMILY_SUITE',
      description: 'ROOM_DESCRIPTIONS.FAMILY_SUITE',
      price: 2500000,
      capacity: 4,
      size: 55,
      beds: '1 King + 2 Singles',
      images: ['assets/images/rooms/family-suite.jpg'],
      amenities: [
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
        'ROOM_AMENITIES_LIST.DESK'
      ],
      available: true
    },
    {
      id: 4,
      name: 'ROOM_TYPES.PRESIDENTIAL_SUITE',
      description: 'ROOM_DESCRIPTIONS.PRESIDENTIAL_SUITE',
      price: 5000000,
      capacity: 4,
      size: 120,
      beds: '1 King + Sofa Bed',
      images: ['assets/images/rooms/presidential-suite.jpg'],
      amenities: [
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
      ],
      available: true
    }
  ];

  private bookings: Booking[] = [
    {
      id: 1,
      roomId: 1,
      guestName: 'John Doe',
      guestEmail: 'john.doe@example.com',
      guestPhone: '0901234567',
      checkInDate: new Date('2025-04-15'),
      checkOutDate: new Date('2025-04-18'),
      numberOfGuests: 2,
      totalPrice: 3600000,
      status: BookingStatus.CHECKED_IN,
      createdAt: new Date('2025-03-20')
    },
    {
      id: 2,
      roomId: 2,
      guestName: 'Jane Smith',
      guestEmail: 'jane.smith@example.com',
      guestPhone: '0909876543',
      checkInDate: new Date('2025-04-20'),
      checkOutDate: new Date('2025-04-25'),
      numberOfGuests: 2,
      totalPrice: 9000000,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date('2025-04-01')
    },
    {
      id: 3,
      roomId: 3,
      guestName: 'Robert Johnson',
      guestEmail: 'robert@example.com',
      guestPhone: '0912345678',
      checkInDate: new Date('2025-04-10'),
      checkOutDate: new Date('2025-04-15'),
      numberOfGuests: 3,
      totalPrice: 12500000,
      status: BookingStatus.CHECKED_OUT,
      createdAt: new Date('2025-03-15')
    },
    {
      id: 4,
      roomId: 4,
      guestName: 'Emily Davis',
      guestEmail: 'emily@example.com',
      guestPhone: '0923456789',
      checkInDate: new Date('2025-05-01'),
      checkOutDate: new Date('2025-05-05'),
      numberOfGuests: 2,
      totalPrice: 20000000,
      status: BookingStatus.PENDING,
      specialRequests: 'Early check-in if possible',
      createdAt: new Date('2025-04-05')
    }
  ];

  private nextRoomId = 5;
  private nextBookingId = 5;

  constructor(private translate: TranslateService) { }

  // Get room with translated content
  private translateRoom(room: Room): Room {
    const translatedRoom = { ...room };
    translatedRoom.name = this.translate.instant(room.name);
    translatedRoom.description = this.translate.instant(room.description);
    translatedRoom.amenities = room.amenities.map(amenity => this.translate.instant(amenity));
    return translatedRoom;
  }

  // ROOMS - Sync methods
  getRooms(): Room[] {
    return this.rooms.map(room => this.translateRoom(room));
  }

  getRoomById(id: number): Room | undefined {
    const room = this.rooms.find(room => room.id === id);
    return room ? this.translateRoom(room) : undefined;
  }

  // ROOMS - Async methods (simulating HTTP requests)
  getRoomsAsync(): Observable<Room[]> {
    return of(this.getRooms()).pipe(delay(500));
  }

  getRoomByIdAsync(id: number): Observable<Room | undefined> {
    return of(this.getRoomById(id)).pipe(delay(300));
  }

  addRoom(room: Room): Observable<Room> {
    const newRoom: Room = {
      ...room,
      id: this.nextRoomId++,
      available: true
    };

    this.rooms.push(newRoom);
    return of(this.translateRoom(newRoom)).pipe(delay(500));
  }

  updateRoom(room: Room): Observable<Room> {
    const index = this.rooms.findIndex(r => r.id === room.id);
    if (index !== -1) {
      this.rooms[index] = { ...room, available: this.rooms[index].available };
      return of(this.translateRoom(this.rooms[index])).pipe(delay(500));
    }
    return of(room).pipe(delay(500));
  }

  deleteRoom(id: number): Observable<boolean> {
    const index = this.rooms.findIndex(r => r.id === id);
    if (index !== -1) {
      // Check if there are bookings for this room
      const hasBookings = this.bookings.some(b => b.roomId === id);
      if (!hasBookings) {
        this.rooms.splice(index, 1);
        return of(true).pipe(delay(500));
      }
    }
    return of(false).pipe(delay(500));
  }

  // ROOM AVAILABILITY
  checkRoomAvailability(roomId: number, checkIn: Date, checkOut: Date): boolean {
    // Convert dates to timestamps for easier comparison
    const checkInTime = new Date(checkIn).getTime();
    const checkOutTime = new Date(checkOut).getTime();
  
    // Find bookings for the specific room
    const roomBookings = this.bookings.filter(booking => 
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

  getAvailableRooms(checkIn: Date, checkOut: Date): Room[] {
    return this.rooms
      .filter(room => this.checkRoomAvailability(room.id, checkIn, checkOut))
      .map(room => this.translateRoom(room));
  }

  getAvailableRoomsAsync(checkIn: Date, checkOut: Date): Observable<Room[]> {
    return of(this.getAvailableRooms(checkIn, checkOut)).pipe(delay(500));
  }

  // BOOKINGS - Sync methods
  getBookings(): Booking[] {
    return [...this.bookings];
  }

  getBookingById(id: number): Booking | undefined {
    return this.bookings.find(booking => booking.id === id);
  }

  // BOOKINGS - Async methods (simulating HTTP requests)
  getBookingsAsync(): Observable<Booking[]> {
    return of([...this.bookings]).pipe(delay(500));
  }

  getBookingByIdAsync(id: number): Observable<Booking | undefined> {
    return of(this.getBookingById(id)).pipe(delay(300));
  }

  addBooking(booking: Partial<Booking>): Observable<Booking> {
    const newBooking: Booking = {
      ...booking as Booking,
      id: this.nextBookingId++,
      status: booking.status || BookingStatus.PENDING,
      createdAt: new Date()
    };

    this.bookings.push(newBooking);
    return of(newBooking).pipe(delay(500));
  }

  updateBooking(booking: Booking): Observable<Booking> {
    const index = this.bookings.findIndex(b => b.id === booking.id);
    if (index !== -1) {
      this.bookings[index] = { ...booking, createdAt: this.bookings[index].createdAt };
      return of(this.bookings[index]).pipe(delay(500));
    }
    return of(booking).pipe(delay(500));
  }

  updateBookingStatus(id: number, status: BookingStatus): Observable<Booking | undefined> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.bookings[index].status = status;
      return of(this.bookings[index]).pipe(delay(500));
    }
    return of(undefined).pipe(delay(500));
  }

  deleteBooking(id: number): Observable<boolean> {
    const index = this.bookings.findIndex(b => b.id === id);
    if (index !== -1) {
      this.bookings.splice(index, 1);
      return of(true).pipe(delay(500));
    }
    return of(false).pipe(delay(500));
  }
}
