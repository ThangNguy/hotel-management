import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ApiConfigService } from './api-config.service';

/**
 * Interface đại diện cho thông tin người dùng
 */
export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

/**
 * Interface cho phản hồi xác thực từ API
 */
interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Interface cho yêu cầu đăng nhập
 */
interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Interface cho yêu cầu đăng ký
 */
interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  email: string;
}

/**
 * Service quản lý xác thực người dùng
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Subjects
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  
  // Observables
  /** Observable của người dùng hiện tại */
  currentUser$ = this.currentUserSubject.asObservable();
  /** Observable của trạng thái xác thực */
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  // Token storage key
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user';

  constructor(
    private http: HttpClient,
    private apiConfigService: ApiConfigService
  ) {
    this.loadUserFromStorage();
  }

  /**
   * Đăng nhập người dùng
   * @param username Tên đăng nhập
   * @param password Mật khẩu
   * @returns Observable kết quả đăng nhập
   */
  login(username: string, password: string): Observable<{ success: boolean; message?: string }> {
    const loginData: LoginRequest = { username, password };
    
    return this.http.post<AuthResponse>(this.apiConfigService.getLoginUrl(), loginData)
      .pipe(
        map(response => {
          this.setUserAndToken(response.user, response.token);
          return { success: true };
        }),
        catchError(error => this.handleAuthError(error, 'login'))
      );
  }

  /**
   * Đăng ký người dùng mới
   * @param userData Thông tin đăng ký
   * @returns Observable kết quả đăng ký
   */
  register(userData: RegisterRequest): Observable<{ success: boolean; message?: string }> {
    return this.http.post<AuthResponse>(this.apiConfigService.getRegisterUrl(), userData)
      .pipe(
        map(response => {
          this.setUserAndToken(response.user, response.token);
          return { success: true };
        }),
        catchError(error => this.handleAuthError(error, 'registration'))
      );
  }

  /**
   * Đăng xuất người dùng
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Lấy token xác thực hiện tại
   * @returns Token xác thực hoặc null
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Xử lý lỗi xác thực
   * @param error Lỗi HTTP
   * @param operation Loại thao tác (login/registration)
   * @returns Observable kết quả lỗi
   */
  private handleAuthError(error: any, operation: string): Observable<{ success: boolean; message: string }> {
    let message = `An error occurred during ${operation}`;
    if (error instanceof HttpErrorResponse) {
      message = error.error?.message || message;
    }
    return of({ success: false, message });
  }

  /**
   * Lưu thông tin người dùng và token
   * @param user Thông tin người dùng
   * @param token Token xác thực
   */
  private setUserAndToken(user: User, token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Tải thông tin người dùng từ localStorage
   */
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem(this.USER_KEY);
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

  /**
   * Kiểm tra xem token có tồn tại không
   * @returns Boolean cho biết token có tồn tại không
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}