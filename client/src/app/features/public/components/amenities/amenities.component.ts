import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material.module';
import { Amenity } from '../../../../models/amenity.model';

@Component({
  selector: 'app-amenities',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './amenities.component.html',
  styleUrl: './amenities.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
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
        name: 'Fine Dining',
        description: 'Experience a variety of international cuisines prepared by our expert chefs.',
        animationDelay: 100
      },
      {
        icon: 'local_bar',
        name: 'Lounge Bar',
        description: 'Relax and enjoy a variety of signature cocktails in our elegant lounge.',
        animationDelay: 200
      },
      {
        icon: 'pool',
        name: 'Infinity Pool',
        description: 'Enjoy our outdoor infinity pool with panoramic city views.',
        animationDelay: 300
      },
      {
        icon: 'spa',
        name: 'Premium Spa',
        description: 'Rejuvenate your body and mind with our exclusive treatments.',
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
        name: '24/7 Room Service',
        description: 'In-room dining service available day and night for your convenience.',
        animationDelay: 600
      },
      {
        icon: 'local_parking',
        name: 'Valet Parking',
        description: 'Complimentary secure valet services for all hotel guests.',
        animationDelay: 700
      }
    ];
  }
}
