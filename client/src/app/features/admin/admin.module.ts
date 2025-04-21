import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';

// Import components
import { AdminLayoutComponent } from '../../admin/components/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from '../../admin/components/admin-dashboard/admin-dashboard.component';
import { AdminRoomsComponent } from '../../admin/components/admin-rooms/admin-rooms.component';
import { AdminBookingsComponent } from '../../admin/components/admin-bookings/admin-bookings.component';
import { AdminLoginComponent } from '../../admin/components/admin-login/admin-login.component';
import { RoomFormDialogComponent } from '../../admin/components/room-form-dialog/room-form-dialog.component';
import { BookingFormDialogComponent } from '../../admin/components/booking-form-dialog/booking-form-dialog.component';
import { DeleteConfirmDialogComponent } from '../../admin/components/delete-confirm-dialog/delete-confirm-dialog.component';
import { AdminRoutingModule } from './admin-routing.module';

/**
 * Admin Module for hotel management administrative functions
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AdminRoutingModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule,
    
    // Standalone components
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