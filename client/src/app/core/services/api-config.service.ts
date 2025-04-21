import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Service for managing API endpoints configuration
 */
@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly apiUrl = environment.apiUrl;

  constructor() { }

  /**
   * Get the base URL for the API
   */
  get baseUrl(): string {
    return this.apiUrl;
  }

  /**
   * Build a complete URL for an API endpoint
   * @param endpoint The endpoint path
   * @returns Full API URL
   */
  getUrl(endpoint: string): string {
    return `${this.apiUrl}/${endpoint}`;
  }

  // Room endpoints
  /**
   * Get URL for rooms endpoint
   */
  getRoomsUrl(): string {
    return this.getUrl('api/rooms');
  }

  /**
   * Get URL for a specific room
   * @param id Room ID
   */
  getRoomUrl(id: number): string {
    return `${this.getRoomsUrl()}/${id}`;
  }

  /**
   * Get URL for available rooms endpoint
   */
  getAvailableRoomsUrl(): string {
    return `${this.getRoomsUrl()}/available`;
  }

  // Booking endpoints
  /**
   * Get URL for bookings endpoint
   */
  getBookingsUrl(): string {
    return this.getUrl('api/bookings');
  }

  /**
   * Get URL for a specific booking
   * @param id Booking ID
   */
  getBookingUrl(id: number): string {
    return `${this.getBookingsUrl()}/${id}`;
  }

  // Authentication endpoints
  /**
   * Get URL for auth base endpoint
   */
  getAuthUrl(): string {
    return this.getUrl('api/auth');
  }

  /**
   * Get URL for login endpoint
   */
  getLoginUrl(): string {
    return `${this.getAuthUrl()}/login`;
  }

  /**
   * Get URL for register endpoint
   */
  getRegisterUrl(): string {
    return `${this.getAuthUrl()}/register`;
  }
}