import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { HotelService } from '../../services/hotel.service';

@Component({
  selector: 'app-amenities',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './amenities.component.html',
  styleUrl: './amenities.component.scss'
})
export class AmenitiesComponent implements OnInit {
  amenities: any[] = [];

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.amenities = this.hotelService.getAmenities();
  }
}
