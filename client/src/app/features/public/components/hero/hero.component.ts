import { Component, OnInit, ChangeDetectionStrategy, DestroyRef, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material.module';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AmenitiesComponent } from '../amenities/amenities.component';
import { RoomsComponent } from '../rooms/rooms.component';
import { ContactComponent } from '../contact/contact.component';

interface BookingFormControls {
  checkIn: FormControl<Date | null>;
  checkOut: FormControl<Date | null>;
  adults: FormControl<number | null>;
  children: FormControl<number | null>;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    AmenitiesComponent,
    RoomsComponent,
    ContactComponent,
    RouterLink
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent implements OnInit {
  bookingForm!: FormGroup<BookingFormControls>;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef); // Available for future rx streams

  ngOnInit() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.bookingForm = this.fb.group<BookingFormControls>({
      checkIn: new FormControl(today, Validators.required),
      checkOut: new FormControl(tomorrow, Validators.required),
      adults: new FormControl(2, [Validators.required, Validators.min(1), Validators.max(10)]),
      children: new FormControl(0, [Validators.required, Validators.min(0), Validators.max(10)])
    });
  }

  checkAvailability() {
    if (this.bookingForm.valid) {
      const { checkIn, checkOut, adults, children } = this.bookingForm.value;

      if (checkIn && checkOut) {
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
}
