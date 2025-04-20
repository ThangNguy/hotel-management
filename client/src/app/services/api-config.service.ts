import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly apiUrl = environment.apiUrl;

  constructor() { }

  get baseUrl(): string {
    return this.apiUrl;
  }

  getUrl(endpoint: string): string {
    return `${this.apiUrl}/${endpoint}`;
  }

  getRoomsUrl(): string {
    return this.getUrl('api/rooms');
  }

  getRoomUrl(id: number): string {
    return `${this.getRoomsUrl()}/${id}`;
  }

  getAvailableRoomsUrl(): string {
    return `${this.getRoomsUrl()}/available`;
  }

  getBookingsUrl(): string {
    return this.getUrl('api/bookings');
  }

  getBookingUrl(id: number): string {
    return `${this.getBookingsUrl()}/${id}`;
  }

  getAuthUrl(): string {
    return this.getUrl('api/auth');
  }

  getLoginUrl(): string {
    return `${this.getAuthUrl()}/login`;
  }

  getRegisterUrl(): string {
    return `${this.getAuthUrl()}/register`;
  }
}