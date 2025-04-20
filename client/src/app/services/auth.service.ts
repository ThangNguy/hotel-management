import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ApiConfigService } from './api-config.service';

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    // Check for existing authentication
    this.loadUserFromStorage();
  }

  login(username: string, password: string): Observable<{ success: boolean; message?: string }> {
    const loginData: LoginRequest = { username, password };
    
    return this.http.post<AuthResponse>(this.apiConfig.getLoginUrl(), loginData)
      .pipe(
        map(response => {
          // Store user data and token
          this.setUserAndToken(response.user, response.token);
          return { success: true };
        }),
        catchError(error => {
          let message = 'An error occurred during login';
          if (error instanceof HttpErrorResponse) {
            message = error.error?.message || message;
          }
          return of({ success: false, message });
        })
      );
  }

  register(userData: RegisterRequest): Observable<{ success: boolean; message?: string }> {
    return this.http.post<AuthResponse>(this.apiConfig.getRegisterUrl(), userData)
      .pipe(
        map(response => {
          // Store user data and token
          this.setUserAndToken(response.user, response.token);
          return { success: true };
        }),
        catchError(error => {
          let message = 'An error occurred during registration';
          if (error instanceof HttpErrorResponse) {
            message = error.error?.message || message;
          }
          return of({ success: false, message });
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setUserAndToken(user: User, token: string): void {
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