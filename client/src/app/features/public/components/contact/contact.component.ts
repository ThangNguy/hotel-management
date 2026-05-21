import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../../material/material.module';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface ContactFormControls {
  fullName: FormControl<string | null>;
  email: FormControl<string | null>;
  phone: FormControl<string | null>;
  message: FormControl<string | null>;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup<ContactFormControls>;
  
  private fb = inject(FormBuilder);
  
  ngOnInit() {
    this.contactForm = this.fb.group<ContactFormControls>({
      fullName: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phone: new FormControl('', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]),
      message: new FormControl('', [Validators.required, Validators.minLength(10)])
    });
  }
  
  submitForm() {
    if (this.contactForm.valid) {
      console.log('Form submitted with values:', this.contactForm.value);
      // Logic to send email or save contact information can be added here
      alert('Thank you for contacting us! We will respond as soon as possible.');
      this.contactForm.reset();
    } else {
      // Mark all fields as touched to display validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        const control = this.contactForm.get(key);
        control?.markAsTouched();
      });
    }
  }
}
