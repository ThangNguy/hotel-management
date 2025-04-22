import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '../../material/material.module';

// Import components
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminRoomsComponent } from './components/admin-rooms/admin-rooms.component';
import { AdminBookingsComponent } from './components/admin-bookings/admin-bookings.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { RoomFormDialogComponent } from './components/room-form-dialog/room-form-dialog.component';
import { BookingFormDialogComponent } from './components/booking-form-dialog/booking-form-dialog.component';
import { DeleteConfirmDialogComponent } from './components/delete-confirm-dialog/delete-confirm-dialog.component';
import { AdminRoutingModule } from './admin-routing.module';
import { BookingCalendarComponent } from './components/booking-calendar/booking-calendar.component';


/**
 * Admin Module for hotel management administrative functions
 * 
 * NOTE: All components have been refactored into features/admin/components
 * The current directory structure follows Angular feature modules standards
 */
@NgModule({
  // No declarations needed as components are standalone
  declarations: [],
  imports: [
    CommonModule,
    AdminRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    
    // Standalone components
    AdminLayoutComponent,
    AdminDashboardComponent,
    AdminRoomsComponent,
    AdminBookingsComponent,
    AdminLoginComponent,
    RoomFormDialogComponent,
    BookingFormDialogComponent,
    DeleteConfirmDialogComponent,
    BookingCalendarComponent
  ]
})
export class AdminModule { }