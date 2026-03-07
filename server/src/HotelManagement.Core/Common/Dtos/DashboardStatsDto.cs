namespace HotelManagement.Core.Common.Dtos
{
    public class DashboardStatsDto
    {
        public int TotalRooms { get; set; }
        public int AvailableRooms { get; set; }
        public double OccupancyRate { get; set; }
        public int TotalBookings { get; set; }
        public decimal MonthlyRevenue { get; set; }
    }
}
