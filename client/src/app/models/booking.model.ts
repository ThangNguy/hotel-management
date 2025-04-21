/**
 * Enum đại diện cho trạng thái đặt phòng
 */
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  CHECKED_OUT = 'CHECKED_OUT',
  CANCELLED = 'CANCELLED'
}

/**
 * Interface đại diện cho thông tin đặt phòng
 */
export interface Booking {
  /**
   * ID của đặt phòng
   */
  id: number;
  
  /**
   * ID của phòng được đặt
   */
  roomId: number;
  
  /**
   * ID của người dùng đặt phòng
   */
  userId?: number;
  
  /**
   * Tên khách hàng
   */
  guestName: string;
  
  /**
   * Email khách hàng
   */
  email: string;
  
  /**
   * Số điện thoại khách hàng
   */
  phone: string;
  
  /**
   * Ngày check-in
   */
  checkInDate: Date | string;
  
  /**
   * Ngày check-out
   */
  checkOutDate: Date | string;
  
  /**
   * Số đêm đặt phòng
   */
  numberOfNights: number;
  
  /**
   * Số lượng người lớn
   */
  adults: number;
  
  /**
   * Số lượng trẻ em
   */
  children: number;
  
  /**
   * Tổng số tiền thanh toán
   */
  totalAmount: number;
  
  /**
   * Trạng thái đặt phòng hiện tại
   */
  status: BookingStatus;
  
  /**
   * Ghi chú bổ sung
   */
  specialRequests?: string;
  
  /**
   * Ngày tạo đặt phòng
   */
  createdAt?: Date | string;
  
  /**
   * Ngày cập nhật đặt phòng
   */
  updatedAt?: Date | string;

  // Thuộc tính bổ sung cho tương thích ngược
  
  /**
   * Email khách hàng (thuộc tính tương thích ngược với email)
   */
  guestEmail?: string;
  
  /**
   * Số điện thoại khách hàng (thuộc tính tương thích ngược với phone)
   */
  guestPhone?: string;
  
  /**
   * Số lượng khách (thuộc tính tương thích ngược)
   */
  numberOfGuests?: number;
  
  /**
   * Tổng số tiền thanh toán (thuộc tính tương thích ngược với totalAmount)
   */
  totalPrice?: number;
}