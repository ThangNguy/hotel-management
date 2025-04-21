import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from './core/services/loading.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { FooterComponent } from './features/public/components/footer/footer.component';
import { HeaderComponent } from './features/public/components/header/header.component';
import { LoadingIndicatorComponent } from './features/public/components/shared/loading-indicator/loading-indicator.component';

/**
 * Root component of the application
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LoadingIndicatorComponent, NgIf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Luxury Hotel & Resort';
  
  constructor(
    public loadingService: LoadingService
  ) {}
  
  ngOnInit(): void {
    // Initialize application
  }
}
