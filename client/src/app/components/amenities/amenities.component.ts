import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { Amenity } from '../../models/amenity.model';

@Component({
  selector: 'app-amenities',
  standalone: true,
  imports: [CommonModule, MaterialModule, TranslateModule],
  templateUrl: './amenities.component.html',
  styleUrl: './amenities.component.scss'
})
export class AmenitiesComponent implements OnInit {
  private amenities: Amenity[] = [];

  ngOnInit(): void {
    this.initAmenities();
  }

  get amenitiesList(): Amenity[] {
    return this.amenities;
  }

  private initAmenities(): void {
    this.amenities = [
      {
        icon: 'wifi',
        name: 'AMENITIES.WIFI.TITLE',
        description: 'AMENITIES.WIFI.DESCRIPTION',
        animationDelay: 0
      },
      {
        icon: 'restaurant',
        name: 'AMENITIES.RESTAURANT.TITLE',
        description: 'AMENITIES.RESTAURANT.DESCRIPTION',
        animationDelay: 100
      },
      {
        icon: 'local_bar',
        name: 'AMENITIES.BAR.TITLE',
        description: 'AMENITIES.BAR.DESCRIPTION',
        animationDelay: 200
      },
      {
        icon: 'pool',
        name: 'AMENITIES.POOL.TITLE',
        description: 'AMENITIES.POOL.DESCRIPTION',
        animationDelay: 300
      },
      {
        icon: 'spa',
        name: 'AMENITIES.SPA.TITLE',
        description: 'AMENITIES.SPA.DESCRIPTION',
        animationDelay: 400
      },
      {
        icon: 'fitness_center',
        name: 'AMENITIES.GYM.TITLE',
        description: 'AMENITIES.GYM.DESCRIPTION',
        animationDelay: 500
      },
      {
        icon: 'room_service',
        name: 'AMENITIES.ROOM_SERVICE.TITLE',
        description: 'AMENITIES.ROOM_SERVICE.DESCRIPTION',
        animationDelay: 600
      },
      {
        icon: 'directions_car',
        name: 'AMENITIES.PARKING.TITLE',
        description: 'AMENITIES.PARKING.DESCRIPTION',
        animationDelay: 700
      },
      {
        icon: 'meeting_room',
        name: 'AMENITIES.CONFERENCE.TITLE',
        description: 'AMENITIES.CONFERENCE.DESCRIPTION',
        animationDelay: 800
      },
      {
        icon: 'emoji_transportation',
        name: 'AMENITIES.AIRPORT_SHUTTLE.TITLE',
        description: 'AMENITIES.AIRPORT_SHUTTLE.DESCRIPTION',
        animationDelay: 900
      },
      {
        icon: 'family_restroom',
        name: 'AMENITIES.FAMILY.TITLE',
        description: 'AMENITIES.FAMILY.DESCRIPTION',
        animationDelay: 1000
      },
      {
        icon: 'security',
        name: 'AMENITIES.SECURITY.TITLE',
        description: 'AMENITIES.SECURITY.DESCRIPTION',
        animationDelay: 1100
      }
    ];
  }
}
