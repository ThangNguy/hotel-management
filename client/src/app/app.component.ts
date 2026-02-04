import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { LoadingService } from './core/services/loading.service';
import { NgIf } from '@angular/common';
import { FooterComponent } from './features/public/components/footer/footer.component';
import { HeaderComponent } from './features/public/components/header/header.component';
import { filter } from 'rxjs/operators';

/**
 * Root component of the application
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Luxury Hotel & Resort';
  isAdminRoute = false;
  
  constructor(
    public loadingService: LoadingService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isAdminRoute = event.url.includes('/admin/');
    });
    
    this.isAdminRoute = this.router.url.includes('/admin/');
  }
}
