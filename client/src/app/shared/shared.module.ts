import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { TranslateModule } from '@ngx-translate/core';

// Standalone components cần import
import { LoadingIndicatorComponent } from '../components/shared/loading-indicator/loading-indicator.component';
import { RatingStarsComponent } from '../components/shared/rating-stars/rating-stars.component';
import { PriceDisplayComponent } from '../components/shared/price-display/price-display.component';

/**
 * Module chứa các components, directives và pipes dùng chung
 * trong toàn bộ ứng dụng
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    TranslateModule,
    
    // Standalone components
    LoadingIndicatorComponent,
    RatingStarsComponent,
    PriceDisplayComponent
  ],
  exports: [
    // Common Angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    TranslateModule,
    
    // Standalone components
    LoadingIndicatorComponent,
    RatingStarsComponent,
    PriceDisplayComponent
  ]
})
export class SharedModule { }