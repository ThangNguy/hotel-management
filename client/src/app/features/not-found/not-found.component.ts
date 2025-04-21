import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from '../../material/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ]
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  /**
   * Navigate back to home page
   */
  goToHome(): void {
    this.router.navigate(['/home']);
  }
}