/**
 * Interface đại diện cho một tiện ích của khách sạn
 */
export interface Amenity {
  /**
   * Icon Material Design sử dụng cho tiện ích
   */
  icon: string;
  
  /**
   * Tên của tiện ích (có thể là key translation)
   */
  name: string;
  
  /**
   * Mô tả của tiện ích (có thể là key translation)
   */
  description: string;
  
  /**
   * Độ trễ animation khi hiển thị (milliseconds)
   */
  animationDelay?: number;
}