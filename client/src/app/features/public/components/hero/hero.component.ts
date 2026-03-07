import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AmenitiesComponent } from '../amenities/amenities.component';
import { RoomsComponent } from '../rooms/rooms.component';
import { ContactComponent } from '../contact/contact.component';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    TranslateModule,
    AmenitiesComponent,
    RoomsComponent,
    ContactComponent
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit {
  bookingForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.bookingForm = this.fb.group({
      checkIn: [today, Validators.required],
      checkOut: [tomorrow, Validators.required],
      adults: [2, [Validators.required, Validators.min(1), Validators.max(10)]],
      children: [0, [Validators.required, Validators.min(0), Validators.max(10)]]
    });
  }

  checkAvailability() {
    if (this.bookingForm.valid) {
      const { checkIn, checkOut, adults, children } = this.bookingForm.value;

      this.router.navigate(['/rooms'], {
        queryParams: {
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          adults,
          children
        }
      });
    }
  }
}
