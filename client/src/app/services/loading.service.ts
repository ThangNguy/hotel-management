import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingMessageSubject = new BehaviorSubject<string>('Loading...');
  
  loading$: Observable<boolean> = this.loadingSubject.asObservable();
  loadingMessage$: Observable<string> = this.loadingMessageSubject.asObservable();

  constructor() { }

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean, message: string = 'Loading...'): void {
    this.loadingSubject.next(isLoading);
    this.loadingMessageSubject.next(message);
  }

  /**
   * Show loading with a specific message
   */
  showLoading(message: string = 'Loading...'): void {
    this.setLoading(true, message);
  }

  /**
   * Hide loading
   */
  hideLoading(): void {
    this.setLoading(false);
  }

  /**
   * Get current loading state
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }
}