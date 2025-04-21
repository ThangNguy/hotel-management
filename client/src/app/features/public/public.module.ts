import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../../material/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';

// Components 
import { HeroComponent } from './components/hero/hero.component';
import { RoomsComponent } from './components/rooms/rooms.component';
import { AmenitiesComponent } from './components/amenities/amenities.component';
import { ContactComponent } from './components/contact/contact.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

// Public Module Routes
const routes: Routes = [
  { path: 'home', component: HeroComponent },
  { path: 'rooms', component: RoomsComponent },
  { path: 'amenities', component: AmenitiesComponent },
  { path: 'contact', component: ContactComponent },
];

/**
 * Public Module for hotel management frontend
 * 
 * NOTE: Đã refactor để đưa tất cả các components vào trong features/public/components
 * Cấu trúc thư mục hiện tại đã tuân theo chuẩn Angular feature modules
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    TranslateModule,
    ReactiveFormsModule,
    
    // Standalone components
    HeroComponent,
    AmenitiesComponent,
    ContactComponent,
    HeaderComponent,
    FooterComponent
  ],
  exports: [
    HeaderComponent,
    FooterComponent
  ]
})
export class PublicModule { }