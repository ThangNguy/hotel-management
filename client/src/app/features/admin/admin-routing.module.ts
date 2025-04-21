import { AuthGuard } from './../../admin/guards/auth.guard';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../admin/components/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from '../../admin/components/admin-dashboard/admin-dashboard.component';
import { AdminRoomsComponent } from '../../admin/components/admin-rooms/admin-rooms.component';
import { AdminBookingsComponent } from '../../admin/components/admin-bookings/admin-bookings.component';
import { AdminLoginComponent } from '../../admin/components/admin-login/admin-login.component';


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
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }