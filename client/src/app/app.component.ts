import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingService } from './services/loading.service';
import { LoadingIndicatorComponent } from './components/shared/loading-indicator/loading-indicator.component';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, TranslateModule, LoadingIndicatorComponent, NgIf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Luxury Hotel & Resort';
  
  constructor(
    private translate: TranslateService,
    public loadingService: LoadingService
  ) {
    // Temporarily use only English - multi-language support disabled
    translate.addLangs(['en']);
    translate.setDefaultLang('en');
    translate.use('en');
  }
  
  ngOnInit(): void {
    // Initialize the application
  }
  
  // Method to change language - temporarily disabled
  switchLanguage(language: string) {
    // Only use English for now
    this.translate.use('en');
  }
}
