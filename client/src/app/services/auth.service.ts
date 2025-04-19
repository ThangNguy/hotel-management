import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check for existing authentication
    this.loadUserFromStorage();
  }

  login(username: string, password: string): Observable<{ success: boolean; message?: string }> {
    // In a real application, this would be an HTTP request to a backend API
    // For this example, we're using mock data
    if (username === 'admin' && password === 'admin123') {
      const user: User = {
        id: 1,
        username: 'admin',
        name: 'Administrator',
        role: 'admin'
      };
      
      // Store user data and token
      this.setUser(user);
      
      return of({ success: true }).pipe(delay(800));
    }
    
    return of({ success: false, message: 'Invalid username or password' }).pipe(delay(800));
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private setUser(user: User): void {
    // Create a fake JWT token (in a real app this would come from the server)
    const token = `fake-jwt-token.${btoa(JSON.stringify(user))}`;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
        this.logout();
      }
    }
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}