import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * Interceptor to manage loading state during HTTP requests
 * Shows loading indicator when requests are in progress
 * and hides it when all requests are completed
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private loadingService: LoadingService) {}

  /**
   * Intercept HTTP requests to manage loading state
   * @param request The original request
   * @param next The HTTP handler
   * @returns Observable of HTTP event
   */
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.shouldSkipLoading(request)) {
      return next.handle(request);
    }

    this.incrementActiveRequests();
    
    return next.handle(request).pipe(
      finalize(() => this.decrementActiveRequests())
    );
  }

  /**
   * Determine if loading indicator should be skipped for certain endpoints
   * @param request HTTP request
   * @returns Boolean indicating if loading should be skipped
   */
  private shouldSkipLoading(request: HttpRequest<unknown>): boolean {
    // Add URLs that should not trigger loading indicator
    const skipUrls: string[] = [
      // Example: '/api/health-check'
    ];
    
    return skipUrls.some(url => request.url.includes(url));
  }

  /**
   * Increment active request counter and show loading if first request
   */
  private incrementActiveRequests(): void {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.loadingService.showLoading();
    }
  }

  /**
   * Decrement active request counter and hide loading if no more requests
   */
  private decrementActiveRequests(): void {
    this.activeRequests--;
    if (this.activeRequests === 0) {
      this.loadingService.hideLoading();
    }
  }
}