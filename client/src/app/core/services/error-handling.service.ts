import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Central error handling service for the application
 * Provides methods to handle and display errors consistently
 */
@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  constructor(
    private snackBar: MatSnackBar
  ) { }

  /**
   * Handles HTTP errors and displays appropriate messages
   * @param error Error to handle
   */
  handleError(error: any): void {
    const errorMessage = this.getErrorMessage(error);
    this.showError(errorMessage);
  }

  /**
   * Extracts error messages from different error types
   * @param error Error to analyze
   * @returns User-friendly error message
   */
  private getErrorMessage(error: any): string {
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof HttpErrorResponse) {
      // API error with response body
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.error) {
        errorMessage = error.error.error;
      } else if (error.error?.title && error.error?.errors) {
        // Handle validation errors
        errorMessage = error.error.title;
        
        // Add specific validation error details if available
        const validationErrors = this.extractValidationErrors(error.error.errors);
        if (validationErrors.length > 0) {
          errorMessage += ': ' + validationErrors.join(', ');
        }
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
   * Extracts validation error messages from the errors object
   * @param errors Validation errors object
   * @returns Array of validation error messages
   */
  private extractValidationErrors(errors: any): string[] {
    if (!errors) return [];
    
    const errorMessages: string[] = [];
    
    Object.keys(errors).forEach(key => {
      if (Array.isArray(errors[key])) {
        errors[key].forEach((message: string) => {
          errorMessages.push(message);
        });
      }
    });
    
    return errorMessages;
  }

  /**
   * Gets error message based on HTTP status code
   * @param status HTTP status code
   * @returns Corresponding error message
   */
  private getHttpStatusErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Bad Request: The server cannot process the request';
      case 401:
        return 'Unauthorized: Authentication is required';
      case 403:
        return 'Forbidden: You do not have permission to access this resource';
      case 404:
        return 'Not Found: The requested resource was not found';
      case 500:
        return 'Server Error: Something went wrong on the server';
      default:
        return 'An unexpected error occurred';
    }
  }

  /**
   * Displays error message in snackbar
   * @param message Error message to display
   * @param duration Display duration (ms)
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
   * Displays success message in snackbar
   * @param message Success message to display
   * @param duration Display duration (ms)
   */
  showSuccess(message: string, duration: number = 3000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Displays warning message in snackbar
   * @param message Warning message to display
   * @param duration Display duration (ms)
   */
  showWarning(message: string, duration: number = 4000): void {
    this.snackBar.open(message, 'Close', {
      duration: duration,
      panelClass: ['warning-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}