import { Component, OnInit, ChangeDetectionStrategy, HostListener, signal, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MaterialModule } from '../../../../material/material.module';
import { CommonModule } from '@angular/common';
import { HotelService } from '../../../../core/services/hotel.service';
import { Hotel } from '../../../../models/hotel.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MaterialModule, CommonModule, TranslateModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent implements OnInit {
  title = signal('Luxury Hotel & Resort');
  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  currentLang = signal('en');

  private hotelService = inject(HotelService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  ngOnInit(): void {
    this.currentLang.set(this.translate.currentLang || 'en');
    
    this.hotelService.getHotelInfo()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (hotel: Hotel) => {
          if (hotel && hotel.name) {
            this.title.set(hotel.name);
          }
        },
        error: (err) => console.error('Failed to load hotel info', err)
      });
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLang.set(lang);
    this.closeMobileMenu();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
    if (this.isMobileMenuOpen()) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    if (this.isMobileMenuOpen()) {
      this.isMobileMenuOpen.set(false);
      document.body.style.overflow = '';
    }
  }
}
