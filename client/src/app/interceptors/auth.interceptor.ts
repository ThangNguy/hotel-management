import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the auth token
    const token = this.authService.getToken();

    // If token exists, clone the request and add the authorization header
    if (token) {
      const authReq = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`)
      });
      
      // Forward the cloned request with the auth header
      return next.handle(authReq).pipe(
        catchError(error => this.handleError(error))
      );
    }
    
    // If no token, forward the original request
    return next.handle(request).pipe(
      catchError(error => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    // If 401 Unauthorized, redirect to login
    if (error.status === 401) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
    
    return throwError(() => error);
  }
}