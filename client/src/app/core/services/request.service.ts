import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorHandlingService } from './error-handling.service';

/**
 * Service trung tâm xử lý các HTTP requests
 * Cung cấp các phương thức generic cho CRUD operations
 */
@Injectable({
  providedIn: 'root'
})
export class RequestService {
  constructor(
    private http: HttpClient,
    private errorHandlingService: ErrorHandlingService
  ) { }

  /**
   * Thực hiện HTTP GET request
   * @param url URL của API endpoint
   * @param params Các tham số query (tùy chọn)
   * @param headers HTTP headers (tùy chọn)
   * @returns Observable của dữ liệu phản hồi
   */
  get<T>(url: string, params?: HttpParams, headers?: HttpHeaders): Observable<T> {
    return this.http.get<T>(url, { params, headers })
      .pipe(
        catchError(error => this.handleError(error, `Error fetching data from ${url}`))
      );
  }

  /**
   * Thực hiện HTTP POST request
   * @param url URL của API endpoint
   * @param body Body của request
   * @param headers HTTP headers (tùy chọn)
   * @returns Observable của dữ liệu phản hồi
   */
  post<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.post<T>(url, body, { headers })
      .pipe(
        catchError(error => this.handleError(error, `Error posting data to ${url}`))
      );
  }

  /**
   * Thực hiện HTTP PUT request
   * @param url URL của API endpoint
   * @param body Body của request
   * @param headers HTTP headers (tùy chọn)
   * @returns Observable của dữ liệu phản hồi
   */
  put<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.put<T>(url, body, { headers })
      .pipe(
        catchError(error => this.handleError(error, `Error updating data at ${url}`))
      );
  }

  /**
   * Thực hiện HTTP PATCH request
   * @param url URL của API endpoint
   * @param body Body của request
   * @param headers HTTP headers (tùy chọn)
   * @returns Observable của dữ liệu phản hồi
   */
  patch<T>(url: string, body: any, headers?: HttpHeaders): Observable<T> {
    return this.http.patch<T>(url, body, { headers })
      .pipe(
        catchError(error => this.handleError(error, `Error patching data at ${url}`))
      );
  }

  /**
   * Thực hiện HTTP DELETE request
   * @param url URL của API endpoint
   * @param headers HTTP headers (tùy chọn)
   * @returns Observable của dữ liệu phản hồi
   */
  delete<T>(url: string, headers?: HttpHeaders): Observable<T> {
    return this.http.delete<T>(url, { headers })
      .pipe(
        catchError(error => this.handleError(error, `Error deleting data at ${url}`))
      );
  }

  /**
   * Xử lý HTTP errors và chuyển cho ErrorHandlingService
   * @param error Phản hồi lỗi
   * @param defaultMessage Thông báo lỗi mặc định
   * @returns Observable ném ra lỗi
   */
  private handleError(error: any, defaultMessage: string): Observable<never> {
    console.error(defaultMessage, error);
    this.errorHandlingService.handleError(error);
    return throwError(() => new Error(error?.message || defaultMessage));
  }
}