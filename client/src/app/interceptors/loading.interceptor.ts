import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Don't show loader for specific endpoints if needed
    // if (request.url.includes('/some-endpoint')) {
    //   return next.handle(request);
    // }

    // Increment active requests counter and show loader if it's the first request
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.loadingService.showLoading();
    }

    return next.handle(request).pipe(
      finalize(() => {
        // Decrement active requests counter and hide loader if no more active requests
        this.activeRequests--;
        if (this.activeRequests === 0) {
          this.loadingService.hideLoading();
        }
      })
    );
  }
}