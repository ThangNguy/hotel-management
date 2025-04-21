import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-indicator',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="loading-container" [class.overlay]="overlay" [class.inline]="!overlay">
      <mat-spinner [diameter]="diameter" [color]="color"></mat-spinner>
      <div *ngIf="message" class="loading-message">{{ message }}</div>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.7);
      z-index: 1000;
    }
    
    .inline {
      padding: 20px;
    }
    
    .loading-message {
      margin-top: 16px;
      font-size: 16px;
      color: #555;
    }
  `]
})
export class LoadingIndicatorComponent {
  @Input() diameter: number = 40;
  @Input() overlay: boolean = false;
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';
  @Input() message: string | null = null;
}