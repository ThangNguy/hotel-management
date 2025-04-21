import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { LoadingIndicatorComponent } from '../features/public/components/shared/loading-indicator/loading-indicator.component';


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
    
    // Standalone components
    LoadingIndicatorComponent,
    // RatingStarsComponent,
    // PriceDisplayComponent
  ],
  exports: [
    // Common Angular modules
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MaterialModule,
    
    // Standalone components
    LoadingIndicatorComponent,
    // RatingStarsComponent,
    // PriceDisplayComponent
  ]
})
export class SharedModule { }