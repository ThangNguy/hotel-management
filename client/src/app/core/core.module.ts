import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Services
import { ApiConfigService } from './services/api-config.service';
import { AuthService } from './services/auth.service';
import { ErrorHandlingService } from './services/error-handling.service';
import { HotelService } from './services/hotel.service';
import { LoadingService } from './services/loading.service';
import { RequestService } from './services/request.service';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';

/**
 * CoreModule contains services and interceptors used
 * throughout the application
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    // Services
    ApiConfigService,
    AuthService,
    ErrorHandlingService,
    HotelService,
    LoadingService,
    RequestService,
    
    // Interceptors
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true }
  ]
})
export class CoreModule {
  /**
   * Constructor to ensure CoreModule is only imported once
   * @param parentModule Reference to CoreModule if already loaded
   */
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule has already been loaded. Import CoreModule only in AppModule.');
    }
  }
}