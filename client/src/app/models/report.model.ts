export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupancyRate: number;
  totalBookings: number;
  monthlyRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  bookingCount: number;
}
