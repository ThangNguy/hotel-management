import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoadingService } from './core/services/loading.service';
import { LoadingIndicatorComponent } from './components/shared/loading-indicator/loading-indicator.component';
import { AsyncPipe, NgIf } from '@angular/common';

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
