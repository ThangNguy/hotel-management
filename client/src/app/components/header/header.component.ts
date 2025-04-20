import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MaterialModule } from '../../material/material.module';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MaterialModule, TranslateModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  title = 'Luxury Hotel & Resort';
  currentLang: string = 'en';

  constructor(private translate: TranslateService) {
    // Always use English
    this.translate.use('en');
  }

  switchLanguage(language: string) {
    // Only use English for now - language switcher disabled
    this.translate.use('en');
    this.currentLang = 'en';
  }
}
