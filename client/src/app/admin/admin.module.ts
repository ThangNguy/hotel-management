import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../material/material.module';

// Import standalone components
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminRoomsComponent } from './components/admin-rooms/admin-rooms.component';
import { AdminBookingsComponent } from './components/admin-bookings/admin-bookings.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { RoomFormDialogComponent } from './components/room-form-dialog/room-form-dialog.component';
import { BookingFormDialogComponent } from './components/booking-form-dialog/booking-form-dialog.component';
import { DeleteConfirmDialogComponent } from './components/delete-confirm-dialog/delete-confirm-dialog.component';
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    // Add all standalone components
    AdminLayoutComponent,
    AdminDashboardComponent,
    AdminRoomsComponent,
    AdminBookingsComponent,
    AdminLoginComponent,
    RoomFormDialogComponent,
    BookingFormDialogComponent,
    DeleteConfirmDialogComponent
  ]
})
export class AdminModule { }