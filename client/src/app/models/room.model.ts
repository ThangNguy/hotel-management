/**
 * Interface đại diện cho mô hình phòng khách sạn
 */
export interface Room {
  /**
   * ID của phòng
   */
  id: number;
  
  /**
   * Tên phòng (có thể là key translation)
   */
  name: string;
  
  /**
   * Mô tả phòng (có thể là key translation)
   */
  description: string;
  
  /**
   * Giá phòng mỗi đêm
   */
  pricePerNight: number;
  
  /**
   * Số người tối đa
   */
  maxOccupancy: number;
  
  /**
   * Danh sách các tiện ích của phòng (có thể là keys translation)
   */
  amenities: string[];
  
  /**
   * Danh sách các đường dẫn hình ảnh phòng
   */
  images: string[];
  
  /**
   * Số phòng khả dụng thuộc loại này
   */
  availableRooms?: number;
  
  /**
   * Kích thước phòng tính bằng mét vuông
   */
  sizeSqm?: number;
  
  /**
   * Có phải là phòng VIP không
   */
  isVIP?: boolean;

  // Các thuộc tính bổ sung để tương thích với code hiện tại
  
  /**
   * Giá phòng (thuộc tính tương thích ngược dùng thay cho pricePerNight)
   */
  price?: number;
  
  /**
   * Số người tối đa (thuộc tính tương thích ngược dùng thay cho maxOccupancy)
   */
  capacity?: number;
  
  /**
   * Kích thước phòng (thuộc tính tương thích ngược dùng thay cho sizeSqm)
   */
  size?: number;
  
  /**
   * Loại giường trong phòng
   */
  beds?: string;
  
  /**
   * Đường dẫn hình ảnh chính của phòng
   */
  imageUrl?: string;
  
  /**
   * Trạng thái sẵn sàng của phòng
   */
  available?: boolean;
}