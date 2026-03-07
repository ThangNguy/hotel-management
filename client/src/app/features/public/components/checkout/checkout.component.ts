import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StripeService, StripePaymentElementComponent, NgxStripeModule } from 'ngx-stripe';
import { StripeElementsOptions, PaymentIntent } from '@stripe/stripe-js';
import { MaterialModule } from '../../../../material/material.module';
import { PaymentService } from '../../../../core/services';
import { Booking } from '../../../../models/booking.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    NgxStripeModule,
    RouterLink
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  @ViewChild(StripePaymentElementComponent) paymentElement!: StripePaymentElementComponent;

  checkoutForm: FormGroup;
  elementsOptions: StripeElementsOptions = {
    locale: 'en'
  };

  booking: Booking | null = null;
  clientSecret: string = '';
  isProcessing = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private stripeService: StripeService,
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.checkoutForm = this.fb.group({
      name: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Get booking data from router state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.booking = navigation.extras.state['booking'];
      this.initPayment();
    } else {
      // Redirect back if no booking data
      this.router.navigate(['/rooms']);
    }
  }

  initPayment(): void {
    if (!this.booking) return;

    this.paymentService.createPaymentIntent(this.booking.totalPrice || 0, this.booking.id!.toString())
      .subscribe({
        next: (res) => {
          this.clientSecret = res.clientSecret;
          this.elementsOptions.clientSecret = res.clientSecret;
        },
        error: (err) => {
          this.errorMessage = 'Failed to initialize payment. Please try again.';
          console.error(err);
        }
      });
  }

  pay(): void {
    if (this.checkoutForm.invalid || !this.clientSecret) return;

    this.isProcessing = true;
    this.errorMessage = '';

    this.stripeService.confirmPayment({
      elements: this.paymentElement.elements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: this.checkoutForm.get('name')?.value
          }
        }
      },
      redirect: 'if_required'
    }).subscribe({
      next: (result) => {
        this.isProcessing = false;
        if (result.error) {
          this.errorMessage = result.error.message || 'Payment failed';
        } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          // Navigate to confirmation
          this.router.navigate(['/booking-confirmation'], {
            state: { booking: this.booking }
          });
        }
      },
      error: (err) => {
        this.isProcessing = false;
        this.errorMessage = 'An unexpected error occurred during payment.';
        console.error(err);
      }
    });
  }
}
