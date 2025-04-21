import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Service for managing application-wide loading state
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingMessageSubject = new BehaviorSubject<string>('Loading...');
  
  /** Observable of current loading state */
  loading$: Observable<boolean> = this.loadingSubject.asObservable();
  
  /** Observable of current loading message */
  loadingMessage$: Observable<string> = this.loadingMessageSubject.asObservable();

  constructor() { }

  /**
   * Set loading state and message
   * @param isLoading Whether the application is loading
   * @param message Optional loading message to display
   */
  setLoading(isLoading: boolean, message: string = 'Loading...'): void {
    this.loadingSubject.next(isLoading);
    this.loadingMessageSubject.next(message);
  }

  /**
   * Show loading indicator with a specific message
   * @param message Optional loading message to display
   */
  showLoading(message: string = 'Loading...'): void {
    this.setLoading(true, message);
  }

  /**
   * Hide loading indicator
   */
  hideLoading(): void {
    this.setLoading(false);
  }

  /**
   * Get current loading state
   * @returns Boolean indicating if application is currently loading
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }
}