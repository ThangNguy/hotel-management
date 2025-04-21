import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ErrorHandlingService } from './error-handling.service';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  constructor(
    private http: HttpClient,
    private errorHandlingService: ErrorHandlingService
  ) { }

  /**
   * Generic GET request
   * @param url The API endpoint URL
   * @param params Optional HTTP parameters
   * @param headers Optional HTTP headers
   * @returns Observable of response data
   */
  get<T>(url: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    return this.http.get<T>(url, { params, headers })
      .pipe(
        catchError(error => this.handleError(error, `Error fetching data from ${url}`))
      );
  }

  /**
   * Generic POST request
   * @param url The API endpoint URL
   * @param body The request body
   * @param headers Optional HTTP headers
   * @returns Observable of response data
   */
  post<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(url, body, { headers })
      .pipe(
        catchError(error => this.handleError(error, `Error posting data to ${url}`))
      );
  }

  /**
   * Generic PUT request
   * @param url The API endpoint URL
   * @param body The request body
   * @param headers Optional HTTP headers
   * @returns Observable of response data
   */
  put<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(url, body, { headers })
      .pipe(
        catchError(error => this.handleError(error, `Error updating data at ${url}`))
      );
  }

  /**
   * Generic PATCH request
   * @param url The API endpoint URL
   * @param body The request body
   * @param headers Optional HTTP headers
   * @returns Observable of response data
   */
  patch<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.patch<T>(url, body, { headers })
      .pipe(
        catchError(error => this.handleError(error, `Error patching data at ${url}`))
      );
  }

  /**
   * Generic DELETE request
   * @param url The API endpoint URL
   * @param headers Optional HTTP headers
   * @returns Observable of response data
   */
  delete<T>(url: string, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<T>(url, { headers })
      .pipe(
        catchError(error => this.handleError(error, `Error deleting data at ${url}`))
      );
  }

  /**
   * Handles HTTP errors 
   * @param error The error response
   * @param defaultMessage A default error message
   * @returns An observable that errors out with the error message
   */
  private handleError(error: any, defaultMessage: string): Observable<never> {
    console.error(defaultMessage, error);
    this.errorHandlingService.handleError(error);
    return throwError(() => new Error(error?.message || defaultMessage));
  }
}