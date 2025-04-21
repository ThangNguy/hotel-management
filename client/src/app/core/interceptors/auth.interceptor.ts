import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * Interceptor for handling authentication
 * - Adds Bearer token to outgoing requests
 * - Handles 401 Unauthorized responses
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  /**
   * Intercept HTTP requests to add authentication token
   * @param request The original request
   * @param next The HTTP handler
   * @returns An observable of the HTTP event
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    if (token) {
      const authRequest = this.addTokenToRequest(request, token);
      return this.handleRequest(next, authRequest);
    }
    
    return this.handleRequest(next, request);
  }

  /**
   * Add authentication token to request
   * @param request Original HTTP request
   * @param token Authentication token
   * @returns Cloned request with auth header
   */
  private addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  /**
   * Handle the HTTP request and catch errors
   * @param handler HTTP handler
   * @param request HTTP request
   * @returns Observable of HTTP event
   */
  private handleRequest(handler: HttpHandler, request: HttpRequest<unknown>): Observable<HttpEvent<unknown>> {
    return handler.handle(request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Handle HTTP errors, specifically authentication errors
   * @param error HTTP error response
   * @returns Observable that throws the error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      this.handleUnauthorized();
    }
    
    return throwError(() => error);
  }

  /**
   * Handle unauthorized (401) responses
   */
  private handleUnauthorized(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}