import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  constructor(private snackBar: MatSnackBar) { }

  /**
   * Handle HTTP errors and display appropriate messages
   */
  handleError(error: any): void {
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof HttpErrorResponse) {
      // API error with response body
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      } else {
        // HTTP error with status code
        switch (error.status) {
          case 400:
            errorMessage = 'Bad request';
            break;
          case 401:
            errorMessage = 'Unauthorized - Please log in';
            break;
          case 403:
            errorMessage = 'Forbidden - You do not have permission';
            break;
          case 404:
            errorMessage = 'Resource not found';
            break;
          case 500:
            errorMessage = 'Server error - Please try again later';
            break;
        }
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    this.showError(errorMessage);
  }

  /**
   * Display error message in a snackbar
   */
  showError(message: string, duration: number = 5000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Display success message in a snackbar
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}