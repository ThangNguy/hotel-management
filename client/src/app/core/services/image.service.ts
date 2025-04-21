import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private baseUrl: string;

  constructor(
    private http: HttpClient, 
    private apiConfigService: ApiConfigService
  ) {
    // Fix: Thêm /api vào URL
    this.baseUrl = `${this.apiConfigService.baseUrl}/api/images`;
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{url: string}>(`${this.baseUrl}/upload`, formData).pipe(
      map(response => {
        // Tạo URL đầy đủ từ đường dẫn tương đối
        return this.getFullImageUrl(response.url);
      }),
      catchError(error => {
        console.error('Error uploading image:', error);
        return throwError(() => new Error('Không thể tải lên hình ảnh. Vui lòng thử lại.'));
      })
    );
  }

  uploadImageWithProgress(file: File): Observable<{progress: number, url?: string}> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{url: string}>(`${this.baseUrl}/upload`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
            return { progress };
          case HttpEventType.Response:
            // Tạo URL đầy đủ từ đường dẫn tương đối
            return { 
              progress: 100, 
              url: event.body?.url ? this.getFullImageUrl(event.body.url) : undefined 
            };
          default:
            return { progress: 0 };
        }
      }),
      catchError(error => {
        console.error('Error uploading image:', error);
        return throwError(() => new Error('Không thể tải lên hình ảnh. Vui lòng thử lại.'));
      })
    );
  }

  uploadMultipleImages(files: File[]): Observable<string[]> {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });

    return this.http.post<{urls: string[]}>(`${this.baseUrl}/upload-multiple`, formData).pipe(
      map(response => {
        // Chuyển đổi mảng URL tương đối thành URL đầy đủ
        return response.urls.map(url => this.getFullImageUrl(url));
      }),
      catchError(error => {
        console.error('Error uploading multiple images:', error);
        return throwError(() => new Error('Không thể tải lên nhiều hình ảnh. Vui lòng thử lại.'));
      })
    );
  }

  deleteImage(imageUrl: string): Observable<any> {
    // Chuyển đổi URL đầy đủ thành đường dẫn tương đối nếu cần
    const relativeUrl = this.getRelativeUrl(imageUrl);
    // Encode the URL to handle special characters
    const encodedUrl = encodeURIComponent(relativeUrl);
    return this.http.delete(`${this.baseUrl}/${encodedUrl}`).pipe(
      catchError(error => {
        console.error('Error deleting image:', error);
        return throwError(() => new Error('Không thể xóa hình ảnh. Vui lòng thử lại.'));
      })
    );
  }

  // Phương thức để tạo URL đầy đủ từ đường dẫn tương đối
  private getFullImageUrl(relativePath: string): string {
    // Đảm bảo đường dẫn tương đối bắt đầu bằng '/'
    if (!relativePath.startsWith('/')) {
      relativePath = '/' + relativePath;
    }
    return `${this.apiConfigService.baseUrl}${relativePath}`;
  }

  // Phương thức để lấy đường dẫn tương đối từ URL đầy đủ
  private getRelativeUrl(fullUrl: string): string {
    // Nếu URL đã là đường dẫn tương đối, trả về nguyên giá trị
    if (!fullUrl.startsWith('http')) {
      return fullUrl;
    }
    
    // Lấy baseUrl từ apiConfigService
    const baseUrl = this.apiConfigService.baseUrl;
    
    // Nếu URL bắt đầu bằng baseUrl, cắt phần baseUrl để lấy đường dẫn tương đối
    if (fullUrl.startsWith(baseUrl)) {
      return fullUrl.substring(baseUrl.length);
    }
    
    // Nếu không khớp với pattern nào, trả về URL gốc
    return fullUrl;
  }
}