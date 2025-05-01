import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Booking } from 'src/app/models/booking.model';
import { BookingGridRow, BookingSource } from 'src/app/models/booking-grid.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BookingGridService {
  private apiUrl = `${environment.apiUrl}/api/bookings`;

  // Danh sách các nguồn đặt phòng và màu sắc tương ứng
  public bookingSources: BookingSource[] = [
    { code: 'DIRECT', name: 'Direct Booking', color: '#4caf50' },
    { code: 'EXPEDIA', name: 'Expedia', color: '#2196f3' },
    { code: 'AGODA', name: 'Agoda', color: '#ff9800' },
    { code: 'BOOKING', name: 'Booking.com', color: '#3f51b5' },
    { code: 'CTRIP', name: 'Ctrip', color: '#9c27b0' },
    { code: 'SEMITEC', name: 'Semitec', color: '#607d8b' },
    { code: 'THANG', name: 'Thắng', color: '#795548' },
    { code: 'THA', name: 'Thả', color: '#673ab7' },
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
    
    // Tạo dữ liệu lưới cho mỗi phòng
    rooms.forEach(room => {
      const gridRow: BookingGridRow = {
        roomId: room.id,
        roomNumber: room.name || `Room ${room.id}`,
        roomType: room.type,
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
    
    // Cập nhật thông tin đặt phòng vào lưới
    bookings.forEach(booking => {
      const checkInDate = new Date(booking.checkInDate);
      const checkOutDate = new Date(booking.checkOutDate);
      const roomIndex = gridData.findIndex(row => row.roomId === booking.roomId);
      
      if (roomIndex >= 0) {
        // Cập nhật trạng thái đặt phòng cho mỗi ngày trong khoảng đặt phòng
        dateRange.forEach(date => {
          if (date >= checkInDate && date < checkOutDate) {
            const dateStr = this.formatDate(date);
            
            // Tìm màu dựa trên nguồn đặt phòng
            const bookingSource = this.extractBookingSource(booking);
            const sourceColor = this.getSourceColor(bookingSource);
            
            gridData[roomIndex].cells[dateStr] = {
              bookingId: booking.id,
              guestName: booking.guestName,
              bookingSource: bookingSource,
              referenceNumber: this.extractReferenceNumber(booking),
              status: 'booked',
              date: new Date(date),
              roomId: booking.roomId,
              color: sourceColor
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
   * Trích xuất nguồn đặt phòng từ thông tin đặt phòng
   */
  private extractBookingSource(booking: Booking): string {
    // Thực hiện logic trích xuất nguồn đặt phòng dựa trên dữ liệu có sẵn
    // Đây là một ví dụ đơn giản, bạn có thể điều chỉnh theo nhu cầu
    if (booking.specialRequests && booking.specialRequests.includes('EXPEDIA')) {
      return 'EXPEDIA';
    } else if (booking.specialRequests && booking.specialRequests.includes('AGODA')) {
      return 'AGODA';
    } else if (booking.specialRequests && booking.specialRequests.includes('CTRIP')) {
      return 'CTRIP';
    } else if (booking.email && booking.email.includes('semitec')) {
      return 'SEMITEC';
    }
    
    // Nguồn mặc định là đặt trực tiếp
    return 'DIRECT';
  }

  /**
   * Trích xuất mã tham chiếu từ thông tin đặt phòng
   */
  private extractReferenceNumber(booking: Booking): string {
    // Thực hiện logic trích xuất mã tham chiếu dựa trên dữ liệu có sẵn
    // Đây là một ví dụ đơn giản, bạn có thể điều chỉnh theo nhu cầu
    if (booking.specialRequests) {
      const matches = booking.specialRequests.match(/[A-Z]+-\d+/);
      if (matches) {
        return matches[0];
      }
    }
    
    return '';
  }

  /**
   * Lấy màu dựa trên nguồn đặt phòng
   */
  private getSourceColor(source: string): string {
    const sourceData = this.bookingSources.find(s => s.code === source);
    return sourceData ? sourceData.color : '#757575'; // Màu mặc định nếu không tìm thấy
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