import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { MaterialModule } from '../../../../material/material.module';
import { environment } from '../../../../../environments/environment';
import { BookingGridService } from '../../services/booking-grid.service';
import { BookingGridRow, BookingGridCell } from '../../../../models/booking-grid.model';
import { Booking } from '../../../../models/booking.model';
import { Room } from '../../../../models/room.model';

// Import các module Angular Material cần thiết
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'; 
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { HotelService } from 'src/app/core/services';

@Component({
  selector: 'app-booking-grid',
  templateUrl: './booking-grid.component.html',
  styleUrls: ['./booking-grid.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    // Import trực tiếp các module Angular Material cần thiết
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSlideToggleModule
  ]
})
export class BookingGridComponent implements OnInit {
  @ViewChild('bookingDialog') bookingDialog!: TemplateRef<any>;

  // Dữ liệu bảng
  gridData: BookingGridRow[] = [];
  rooms: Room[] = [];
  bookings: Booking[] = [];
  dateHeaders: Date[] = [];
  // Form và điều khiển
  bookingForm: FormGroup;
  isEditMode = false;
  currentBooking: Partial<Booking> = {};
  selectedRoomId: number | null = null;
  selectedDate: Date | null = null;
  
  // Ngày hiện tại và khoảng thời gian hiển thị
  currentDate = new Date();
  startDate: Date;
  endDate: Date;
  displayMonths: number = 1;
  monthsOffset = 0;

  // Tùy chọn hiển thị
  showRoomTypes = true;

  // Trạng thái tải dữ liệu
  isLoading = false;
  error: string | null = null;

  constructor(
    private bookingGridService: BookingGridService, 
    private http: HttpClient,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private hotelService: HotelService
  ) {
    // Khởi tạo ngày bắt đầu và kết thúc
    this.startDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    this.endDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + this.displayMonths, 0);

    // Khởi tạo form
    this.bookingForm = this.fb.group({
      id: [null],
      roomId: [null, Validators.required],
      guestName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      checkIn: [null, Validators.required],
      checkOut: [null, Validators.required],
      specialRequests: [''],
      adults: [1, [Validators.required, Validators.min(1)]],
      children: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadGridData();
  }

  /**
   * Tải dữ liệu cho lưới đặt phòng
   */
  loadGridData(): void {
    this.isLoading = true;
    this.error = null;
    
    // Tạo dải ngày cho tiêu đề cột
    this.dateHeaders = this.generateDateArray(this.startDate, this.endDate);

    // Tải danh sách phòng và đặt phòng
    forkJoin({
      rooms: this.getRooms(),
      bookings: this.getBookings()
    }).subscribe({
      next: (result) => {
        this.rooms = result.rooms;
        this.bookings = result.bookings;
        
        // Tạo dữ liệu lưới từ phòng và đặt phòng
        this.gridData = this.bookingGridService.createGridData(
          this.bookings, 
          this.rooms, 
          this.startDate, 
          this.endDate
        );
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading booking grid data:', err);
        this.error = 'Không thể tải dữ liệu đặt phòng. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Tải danh sách phòng
   */
  getRooms(): Observable<Room[]> {
    return this.hotelService.getRoomsAsync();
  }

  /**
   * Tải danh sách đặt phòng
   */
  getBookings(): Observable<Booking[]> {
    return this.bookingGridService.getBookingsForGrid(this.startDate, this.endDate);
  }

  /**
   * Tạo mảng các ngày từ startDate đến endDate
   */
  generateDateArray(startDate: Date, endDate: Date): Date[] {
    const dateArray: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dateArray;
  }

  /**
   * Chuyển tới tháng trước
   */
  previousMonth(): void {
    this.monthsOffset--;
    this.updateDateRange();
    this.loadGridData();
  }

  /**
   * Chuyển tới tháng sau
   */
  nextMonth(): void {
    this.monthsOffset++;
    this.updateDateRange();
    this.loadGridData();
  }

  /**
   * Quay lại tháng hiện tại
   */
  currentMonth(): void {
    this.monthsOffset = 0;
    this.updateDateRange();
    this.loadGridData();
  }

  /**
   * Cập nhật khoảng ngày hiển thị dựa trên monthsOffset
   */
  updateDateRange(): void {
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() + this.monthsOffset);
    
    this.startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    this.endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + this.displayMonths, 0);
  }

  /**
   * Format ngày hiển thị
   */
  formatDate(date: Date, format: 'short' | 'full' = 'short'): string {
    if (format === 'short') {
      return date.getDate().toString().padStart(2, '0');
    } else {
      return date.toLocaleDateString('vi-VN', { 
        weekday: 'short', 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  }

  /**
   * Lấy key cho truy cập vào cells - định dạng giống với service
   */
  getCellKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Format tháng hiển thị
   */
  formatMonth(date: Date): string {
    return date.toLocaleDateString('vi-VN', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  /**
   * Lấy màu nền cho ô dựa trên trạng thái
   */
  getCellBackground(cell: BookingGridCell): string {
    if (!cell) {
      return 'transparent';
    }
    
    if (cell.status === 'booked') {
      return cell.color || 'transparent';
    }
    return 'transparent';
  }

  /**
   * Lấy màu chữ cho ô
   */
  getCellTextColor(cell: BookingGridCell): string {
    if (!cell) {
      return '#000000';
    }
    
    if (cell.status === 'booked') {
      // Kiểm tra màu nền có sáng hay không để chọn màu chữ phù hợp
      const color = cell.color || '#f44336';
      const rgb = this.hexToRgb(color);
      
      if (rgb) {
        // Tính độ sáng theo công thức YIQ
        const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
        // Ngưỡng độ sáng điều chỉnh để tăng tương phản
        return brightness > 160 ? '#000000' : '#ffffff';
      }
    }
    
    return '#000000';
  }

  /**
   * Chuyển mã màu hex sang RGB
   */
  private hexToRgb(hex: string): { r: number, g: number, b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Kiểm tra xem ngày có phải là ngày hiện tại không
   */
  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }

  /**
   * Lấy class CSS cho ô dựa trên ngày và trạng thái
   */
  getCellClass(date: Date, cell: BookingGridCell): string {
    let classes = '';
    
    if (this.isToday(date)) {
      classes += ' today';
    }
    
    if (date.getDay() === 0 || date.getDay() === 6) {
      classes += ' weekend';
    }
    
    if (!cell) {
      return classes + ' available';
    }
    
    if (cell.status === 'booked') {
      classes += ' booked';
    } else {
      classes += ' available';
    }
    
    return classes;
  }

  /**
   * Xử lý khi click vào ô đặt phòng
   */
  onCellClick(row: BookingGridRow, date: string, cell: BookingGridCell): void {
    if (cell && cell.status === 'booked' && cell.bookingId) {
      // Chỉnh sửa đặt phòng hiện có
      this.editBooking(cell.bookingId);
    } else {
      // Tạo đặt phòng mới
      this.addBooking(row.roomId, new Date(date));
    }
  }

  /**
   * Thêm đặt phòng mới
   */
  addBooking(roomId?: number, date?: Date): void {
    this.isEditMode = false;
    
    // Reset form và thiết lập giá trị mặc định
    this.bookingForm.reset({
      adults: 1,
      children: 0
    });
    
    // Nếu có roomId, thiết lập cho form
    if (roomId) {
      this.bookingForm.patchValue({ roomId });
    }
    
    // Nếu có ngày, thiết lập ngày check-in và check-out
    if (date) {
      const checkIn = new Date(date);
      const checkOut = new Date(date);
      checkOut.setDate(checkOut.getDate() + 1);
      
      this.bookingForm.patchValue({
        checkIn,
        checkOut
      });
    }
    
    // Mở dialog
    this.dialog.open(this.bookingDialog, {
      width: '500px',
      disableClose: true
    });
  }

  /**
   * Chỉnh sửa đặt phòng
   */
  editBooking(bookingId: number): void {
    this.isEditMode = true;
    
    // Tìm thông tin đặt phòng
    const booking = this.bookings.find(b => b.id === bookingId);
    
    if (booking) {
      this.currentBooking = { ...booking };
      
      // Thiết lập giá trị cho form
      this.bookingForm.patchValue({
        id: booking.id,
        roomId: booking.roomId,
        guestName: booking.guestName,
        email: booking.email || booking.guestEmail,
        phone: booking.phone || booking.guestPhone,
        checkIn: new Date(booking.checkInDate),
        checkOut: new Date(booking.checkOutDate),
        specialRequests: booking.specialRequests,
        adults: booking.adults || 1,
        children: booking.children || 0
      });
      
      // Mở dialog
      this.dialog.open(this.bookingDialog, {
        width: '500px',
        disableClose: true
      });
    }
  }

  /**
   * Lưu thông tin đặt phòng
   */
  saveBooking(): void {
    if (this.bookingForm.invalid) {
      return;
    }
    
    const formValue = this.bookingForm.value;
    
    // Tạo đối tượng booking từ form
    const booking: Partial<Booking> = {
      id: formValue.id,
      roomId: formValue.roomId,
      guestName: formValue.guestName,
      email: formValue.email,
      phone: formValue.phone,
      checkInDate: formValue.checkIn,
      checkOutDate: formValue.checkOut,
      specialRequests: formValue.specialRequests,
      adults: formValue.adults,
      children: formValue.children,
      numberOfNights: this.calculateNights(formValue.checkIn, formValue.checkOut)
    };
    
    // Gọi API để lưu đặt phòng
    this.bookingGridService.saveBooking(booking).subscribe({
      next: () => {
        this.dialog.closeAll();
        this.loadGridData();
      },
      error: (err) => {
        console.error('Error saving booking:', err);
        // Hiển thị thông báo lỗi nếu cần
      }
    });
  }

  /**
   * Xóa đặt phòng
   */
  deleteBooking(): void {
    if (!this.currentBooking.id) {
      return;
    }
    
    this.bookingGridService.deleteBooking(this.currentBooking.id).subscribe({
      next: () => {
        this.dialog.closeAll();
        this.loadGridData();
      },
      error: (err) => {
        console.error('Error deleting booking:', err);
        // Hiển thị thông báo lỗi nếu cần
      }
    });
  }

  /**
   * Tính số đêm từ ngày check-in đến check-out
   */
  private calculateNights(checkIn: Date, checkOut: Date): number {
    const diffTime = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Lấy danh sách phòng cho dropdown
   */
  availableRooms(): Room[] {
    return this.rooms;
  }

  /**
   * Kiểm tra xem ngày có phải là cuối tuần không
   */
  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  /**
   * Kiểm tra xem ngày có phải là ngày đầu tháng không
   */
  isFirstOfMonth(date: Date): boolean {
    return date.getDate() === 1;
  }
}