import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { AdminRoomsComponent } from './components/admin-rooms/admin-rooms.component';
import { AdminBookingsComponent } from './components/admin-bookings/admin-bookings.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { BookingCalendarComponent } from './components/booking-calendar/booking-calendar.component';
import { BookingGridComponent } from './components/booking-grid/booking-grid.component';
import { AuthGuard } from './guards/auth.guard';

/**
 * Admin module routing configuration
 */
const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: AdminLoginComponent
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'rooms',
        component: AdminRoomsComponent
      },
      {
        path: 'bookings',
        component: AdminBookingsComponent
      },
      {
        path: 'booking-calendar',
        component: BookingCalendarComponent
      },
      {
        path: 'booking-grid',
        component: BookingGridComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }