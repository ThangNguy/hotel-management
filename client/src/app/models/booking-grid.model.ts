/**
 * Interface đại diện cho dữ liệu ô trong lưới đặt phòng
 */
export interface BookingGridCell {
  /**
   * ID đặt phòng (nếu có)
   */
  bookingId?: number;
  
  /**
   * Tên khách hàng
   */
  guestName?: string;
  
  /**
   * Nguồn đặt phòng (VD: EXPEDIA, AGODA, SEMITEC, ...)
   */
  bookingSource?: string;
  
  /**
   * Mã tham chiếu từ nguồn bên ngoài
   */
  referenceNumber?: string;
  
  /**
   * Trạng thái của ô (đã đặt, trống, ...)
   */
  status: 'booked' | 'available' | 'blocked';
  
  /**
   * Ngày tháng của ô
   */
  date: Date;
  
  /**
   * ID phòng
   */
  roomId: number;
  
  /**
   * Màu hiển thị cho ô (tùy thuộc vào trạng thái hoặc nguồn đặt phòng)
   */
  color?: string;
}

/**
 * Interface đại diện cho dữ liệu hàng trong lưới đặt phòng
 */
export interface BookingGridRow {
  /**
   * ID phòng
   */
  roomId: number;
  
  /**
   * Số phòng hoặc tên phòng
   */
  roomNumber: string;
  
  /**
   * Loại phòng hoặc tầng
   */
  roomType?: string;
  
  /**
   * Các ô dữ liệu cho từng ngày
   */
  cells: { [key: string]: BookingGridCell };
}

/**
 * Interface đại diện cho dữ liệu nguồn đặt phòng
 */
export interface BookingSource {
  /**
   * Mã nguồn đặt phòng
   */
  code: string;
  
  /**
   * Tên hiển thị của nguồn đặt phòng
   */
  name: string;
  
  /**
   * Màu hiển thị cho nguồn đặt phòng
   */
  color: string;
}

/**
 * Enum trạng thái phòng
 */
export enum RoomStatus {
  AVAILABLE = '1',
  BOOKED = 'booked'
}