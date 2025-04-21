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
 * CoreModule chứa các services và interceptors được sử dụng 
 * trên toàn bộ ứng dụng
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
   * Constructor để đảm bảo CoreModule chỉ được import một lần
   * @param parentModule Tham chiếu đến CoreModule nếu đã được tải
   */
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule đã được tải. Import CoreModule chỉ trong AppModule.');
    }
  }
}