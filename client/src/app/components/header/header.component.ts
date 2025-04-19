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
  currentLang: string;

  constructor(private translate: TranslateService) {
    this.currentLang = this.translate.currentLang || 'vi';
  }

  switchLanguage(language: string) {
    this.translate.use(language);
    this.currentLang = language;
  }
}
