import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingService } from './core/services/loading.service';
import { LoadingIndicatorComponent } from './components/shared/loading-indicator/loading-indicator.component';
import { AsyncPipe, NgIf } from '@angular/common';

/**
 * Root component của ứng dụng
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, TranslateModule, LoadingIndicatorComponent, NgIf, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Luxury Hotel & Resort';
  
  constructor(
    private translate: TranslateService,
    public loadingService: LoadingService
  ) {
    // Khởi tạo ngôn ngữ
    this.initializeLanguage();
  }
  
  ngOnInit(): void {
    // Khởi tạo ứng dụng
  }
  
  /**
   * Khởi tạo cấu hình ngôn ngữ của ứng dụng
   */
  private initializeLanguage(): void {
    // Tạm thời chỉ sử dụng tiếng Anh - hỗ trợ đa ngôn ngữ đang bị vô hiệu hóa
    this.translate.addLangs(['en']);
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }
  
  /**
   * Phương thức để thay đổi ngôn ngữ - tạm thời bị vô hiệu hóa
   * @param language Mã ngôn ngữ
   */
  switchLanguage(language: string): void {
    // Chỉ sử dụng tiếng Anh
    this.translate.use('en');
  }
}
