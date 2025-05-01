import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Booking } from 'src/app/models/booking.model';
import { BookingGridRow } from 'src/app/models/booking-grid.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingGridService {
  private apiUrl = `${environment.apiUrl}/api/bookings`;
  private usedColorsThisMonth: Map<string, string[]> = new Map(); // Lưu trữ màu đã sử dụng theo tháng

  // Danh sách các màu có thể sử dụng
  private availableColors: string[] = [
    '#4caf50', '#2196f3', '#ff9800', '#3f51b5', '#9c27b0', 
    '#607d8b', '#795548', '#673ab7', '#e91e63', '#009688',
    '#cddc39', '#ffc107', '#00bcd4', '#8bc34a', '#ff5722'
  ];

  constructor(private http: HttpClient) { }

  /**
   * Lấy dữ liệu đặt phòng cho lưới theo khoảng thời gian
   */
  getBookingsForGrid(startDate: Date, endDate: Date): Observable<Booking[]> {
    const params = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
    
    return this.http.get<Booking[]>(`${this.apiUrl}/range`, { params });
  }

  /**
   * Tạo dữ liệu lưới từ dữ liệu đặt phòng và danh sách phòng
   */
  createGridData(bookings: Booking[], rooms: any[], startDate: Date, endDate: Date): BookingGridRow[] {
    const gridData: BookingGridRow[] = [];
    const dateRange = this.getDateRange(startDate, endDate);
    
    // Khởi tạo lại bảng màu đã sử dụng cho tháng hiện tại
    const monthKey = `${startDate.getFullYear()}-${startDate.getMonth() + 1}`;
    if (!this.usedColorsThisMonth.has(monthKey)) {
      this.usedColorsThisMonth.set(monthKey, []);
    }
    
    // Tạo dữ liệu lưới cho mỗi phòng
    rooms.forEach(room => {
      const gridRow: BookingGridRow = {
        roomId: room.id,
        roomNumber: room.name || `Room ${room.id}`,
        roomType: room.beds || 'Phòng tiêu chuẩn', // Sử dụng thuộc tính beds thay vì type không tồn tại
        cells: {}
      };
      
      // Tạo ô trống cho mỗi ngày
      dateRange.forEach(date => {
        const dateStr = this.formatDate(date);
        gridRow.cells[dateStr] = {
          status: 'available',
          date: new Date(date),
          roomId: room.id
        };
      });
      
      gridData.push(gridRow);
    });
    
    // Tạo bảng ánh xạ booking ID to màu
    const bookingColors = new Map<number, string>();
    
    // Cập nhật thông tin đặt phòng vào lưới
    bookings.forEach(booking => {
      const checkInDate = new Date(booking.checkInDate);
      const checkOutDate = new Date(booking.checkOutDate);
      const roomIndex = gridData.findIndex(row => row.roomId === booking.roomId);
      
      if (roomIndex >= 0) {
        // Chọn màu ngẫu nhiên không trùng cho booking này
        let bookingColor = bookingColors.get(booking.id);
        if (!bookingColor) {
          bookingColor = this.getRandomUniqueColor(monthKey);
          bookingColors.set(booking.id, bookingColor);
        }
        
        // Cập nhật trạng thái đặt phòng cho mỗi ngày trong khoảng đặt phòng
        dateRange.forEach(date => {
          if (date >= checkInDate && date < checkOutDate) {
            const dateStr = this.formatDate(date);
            
            gridData[roomIndex].cells[dateStr] = {
              bookingId: booking.id,
              guestName: booking.guestName,
              status: 'booked',
              date: new Date(date),
              roomId: booking.roomId,
              color: bookingColor
            };
          }
        });
      }
    });
    
    return gridData;
  }

  /**
   * Tạo mảng các ngày trong khoảng từ startDate đến endDate
   */
  private getDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  /**
   * Format ngày thành chuỗi YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Lấy màu ngẫu nhiên không trùng lặp trong một tháng
   */
  private getRandomUniqueColor(monthKey: string): string {
    const usedColors = this.usedColorsThisMonth.get(monthKey) || [];
    const availableUnusedColors = this.availableColors.filter(color => !usedColors.includes(color));
    
    // Nếu đã hết màu không trùng, tạo màu ngẫu nhiên mới
    if (availableUnusedColors.length === 0) {
      const r = Math.floor(Math.random() * 200) + 20; // 20-220 để tránh quá tối hoặc quá sáng
      const g = Math.floor(Math.random() * 200) + 20;
      const b = Math.floor(Math.random() * 200) + 20;
      const newColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      usedColors.push(newColor);
      this.usedColorsThisMonth.set(monthKey, usedColors);
      return newColor;
    }
    
    // Nếu còn màu không trùng, chọn ngẫu nhiên một màu
    const randomIndex = Math.floor(Math.random() * availableUnusedColors.length);
    const selectedColor = availableUnusedColors[randomIndex];
    usedColors.push(selectedColor);
    this.usedColorsThisMonth.set(monthKey, usedColors);
    return selectedColor;
  }

  /**
   * Cập nhật hoặc tạo mới đặt phòng
   */
  saveBooking(booking: Partial<Booking>): Observable<Booking> {
    if (booking.id) {
      return this.http.put<Booking>(`${this.apiUrl}/${booking.id}`, booking);
    } else {
      return this.http.post<Booking>(this.apiUrl, booking);
    }
  }

  /**
   * Xóa đặt phòng
   */
  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}