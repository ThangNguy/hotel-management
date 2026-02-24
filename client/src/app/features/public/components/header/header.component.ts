import { Component, OnInit } from '@angular/core';
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
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  title = 'Luxury Hotel & Resort';

  constructor(
    private hotelService: HotelService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.hotelService.getHotelInfo().subscribe({
      next: (hotel: Hotel) => {
        if (hotel && hotel.name) {
          this.title = hotel.name;
        }
      },
      error: (err) => console.error('Failed to load hotel info', err)
    });
  }

  switchLanguage(lang: string): void {
    this.translate.use(lang);
  }
}
