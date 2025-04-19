import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material/material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AmenitiesComponent } from '../amenities/amenities.component';
import { RoomsComponent } from '../rooms/rooms.component';
import { ContactComponent } from '../contact/contact.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    TranslateModule
  ],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent implements OnInit {
  bookingForm!: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    private translateService: TranslateService
  ) {}
  
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
      console.log('Form submitted with values:', this.bookingForm.value);
      // Ở đây có thể thêm logic kiểm tra phòng trống thông qua service
    }
  }
}
