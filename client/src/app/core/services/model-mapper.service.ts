/**
 * Class cung cấp các phương thức chuyển đổi giữa mô hình dữ liệu cũ và mới
 * để đảm bảo tương thích trong quá trình refactoring
 */
export class ModelMapperService {
  /**
   * Map từ mô hình Room cũ sang mới và ngược lại
   * @param room - Đối tượng Room cần chuyển đổi
   * @returns Đối tượng Room đã chuyển đổi
   */
  static mapRoom(room: any): any {
    if (!room) return null;
    
    // Đảm bảo tương thích hai chiều giữa các thuộc tính cũ và mới
    return {
      ...room,
      // Map các thuộc tính chính
      pricePerNight: room.pricePerNight || room.price || 0,
      price: room.price || room.pricePerNight || 0,
      maxOccupancy: room.maxOccupancy || room.capacity || 1,
      capacity: room.capacity || room.maxOccupancy || 1,
      sizeSqm: room.sizeSqm || room.size || 0,
      size: room.size || room.sizeSqm || 0,
      
      // Đảm bảo các thuộc tính mảng tồn tại
      images: room.images || (room.imageUrl ? [room.imageUrl] : []),
      
      // Đảm bảo các thuộc tính boolean tồn tại
      available: room.available !== undefined ? room.available : true,
    };
  }
  
  /**
   * Map từ mô hình Booking cũ sang mới và ngược lại
   * @param booking - Đối tượng Booking cần chuyển đổi
   * @returns Đối tượng Booking đã chuyển đổi
   */
  static mapBooking(booking: any): any {
    if (!booking) return null;
    
    // Đảm bảo tương thích hai chiều giữa các thuộc tính cũ và mới
    return {
      ...booking,
      // Map các thuộc tính chính
      email: booking.email || booking.guestEmail || '',
      guestEmail: booking.guestEmail || booking.email || '',
      phone: booking.phone || booking.guestPhone || '',
      guestPhone: booking.guestPhone || booking.phone || '',
      totalAmount: booking.totalAmount || booking.totalPrice || 0,
      totalPrice: booking.totalPrice || booking.totalAmount || 0,
      numberOfGuests: booking.numberOfGuests || (booking.adults + (booking.children || 0)) || 1,
      
      // Đảm bảo các thuộc tính ngày tồn tại
      createdAt: booking.createdAt || new Date(),
      updatedAt: booking.updatedAt || new Date(),
    };
  }
}