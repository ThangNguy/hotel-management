export interface Room {
  id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  size: number;
  amenities: string[];
  available: boolean;
  beds: string;
  images: string[];
}