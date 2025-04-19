import { Routes } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { HeroComponent } from './components/hero/hero.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { AmenitiesComponent } from './components/amenities/amenities.component';
import { ContactComponent } from './components/contact/contact.component';
import { FooterComponent } from './components/footer/footer.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HeroComponent },
  { path: 'rooms', component: RoomsComponent },
  { path: 'amenities', component: AmenitiesComponent },
  { path: 'contact', component: ContactComponent },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];
