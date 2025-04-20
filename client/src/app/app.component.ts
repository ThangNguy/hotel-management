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
    // Set default language from browser or use Vietnamese as fallback
    const browserLang = navigator.language.split('-')[0];
    const defaultLang = browserLang.match(/en|vi/) ? browserLang : 'vi';
    
    // Set available languages
    translate.addLangs(['en', 'vi']);
    
    // Set default language
    translate.setDefaultLang(defaultLang);
    translate.use(defaultLang);
  }
  
  ngOnInit(): void {
    // Initialize the application
  }
  
  // Method to change language
  switchLanguage(language: string) {
    this.translate.use(language);
  }
}
