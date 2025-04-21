import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MaterialModule } from '../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';

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


/**
 * Admin Module for hotel management administrative functions
 * 
 * NOTE: Đã refactor để đưa tất cả các components vào trong features/admin/components
 * Cấu trúc thư mục hiện tại đã tuân theo chuẩn Angular feature modules
 */
@NgModule({
  // Không cần declarations vì các components đã là standalone
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