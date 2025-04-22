import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Service xử lý lỗi trung tâm cho ứng dụng
 * Cung cấp các phương thức để xử lý và hiển thị lỗi một cách thống nhất
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  constructor(
    private snackBar: MatSnackBar
  ) { }

  /**
   * Xử lý HTTP errors và hiển thị thông báo phù hợp
   * @param error Lỗi cần xử lý
   */
  handleError(error: any): void {
    const errorMessage = this.getErrorMessage(error);
    this.showError(errorMessage);
  }

  /**
   * Trích xuất thông báo lỗi từ các loại lỗi khác nhau
   * @param error Lỗi cần phân tích
   * @returns Thông báo lỗi dễ hiểu
   */
  private getErrorMessage(error: any): string {
    let errorMessage = 'ERROR.UNEXPECTED';
    
    if (error instanceof HttpErrorResponse) {
      // API error with response body
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      } else {
        // HTTP error with status code
        errorMessage = this.getHttpStatusErrorMessage(error.status);
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return errorMessage;
  }

  /**
   * Lấy thông báo lỗi dựa trên mã trạng thái HTTP
   * @param status Mã trạng thái HTTP
   * @returns Thông báo lỗi tương ứng
   */
  private getHttpStatusErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'ERROR.BAD_REQUEST';
      case 401:
        return 'ERROR.UNAUTHORIZED';
      case 403:
        return 'ERROR.FORBIDDEN';
      case 404:
        return 'ERROR.NOT_FOUND';
      case 500:
        return 'ERROR.SERVER_ERROR';
      default:
        return 'ERROR.UNEXPECTED';
    }
  }

  /**
   * Hiển thị thông báo lỗi trong snackbar
   * @param message Thông báo lỗi cần hiển thị
   * @param duration Thời gian hiển thị (ms)
   */
  showError(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'COMMON.CLOSE', {
      duration: duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Hiển thị thông báo thành công trong snackbar
   * @param message Thông báo thành công cần hiển thị
   * @param duration Thời gian hiển thị (ms)
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'COMMON.CLOSE', {
      duration: duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Hiển thị thông báo cảnh báo trong snackbar
   * @param message Thông báo cảnh báo cần hiển thị
   * @param duration Thời gian hiển thị (ms)
   */
  showWarning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'COMMON.CLOSE', {
      duration: duration,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}