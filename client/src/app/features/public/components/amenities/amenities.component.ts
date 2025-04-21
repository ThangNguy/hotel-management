import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material.module';
import { Amenity } from '../../../../models/amenity.model';

@Component({
  selector: 'app-amenities',
  standalone: true,
  imports: [CommonModule, MaterialModule],
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
        name: 'Free Wi-Fi',
        description: 'High-speed internet access throughout the hotel property.',
        animationDelay: 0
      },
      {
        icon: 'restaurant',
        name: 'Restaurant',
        description: 'Fine dining with a variety of international cuisines prepared by our expert chefs.',
        animationDelay: 100
      },
      {
        icon: 'local_bar',
        name: 'Bar & Lounge',
        description: 'Relax and enjoy a variety of drinks and cocktails in our elegant lounge area.',
        animationDelay: 200
      },
      {
        icon: 'pool',
        name: 'Swimming Pool',
        description: 'Enjoy our outdoor infinity pool with panoramic views of the city.',
        animationDelay: 300
      },
      {
        icon: 'spa',
        name: 'Spa & Wellness',
        description: 'Rejuvenate your body and mind with our range of spa treatments and services.',
        animationDelay: 400
      },
      {
        icon: 'fitness_center',
        name: 'Fitness Center',
        description: 'Stay fit with our state-of-the-art gym equipment and personal trainers.',
        animationDelay: 500
      },
      {
        icon: 'room_service',
        name: 'Room Service',
        description: '24-hour in-room dining service available for all guests.',
        animationDelay: 600
      },
      {
        icon: 'directions_car',
        name: 'Free Parking',
        description: 'Complimentary valet and self-parking available for hotel guests.',
        animationDelay: 700
      },
      {
        icon: 'meeting_room',
        name: 'Conference Rooms',
        description: 'Modern meeting spaces equipped with the latest technology for business events.',
        animationDelay: 800
      },
      {
        icon: 'emoji_transportation',
        name: 'Airport Shuttle',
        description: 'Convenient transportation service between the hotel and airport.',
        animationDelay: 900
      },
      {
        icon: 'family_restroom',
        name: 'Family Friendly',
        description: 'Special amenities and activities for families with children.',
        animationDelay: 1000
      },
      {
        icon: 'security',
        name: '24/7 Security',
        description: 'Round-the-clock security services to ensure the safety of all guests.',
        animationDelay: 1100
      }
    ];
  }
}
