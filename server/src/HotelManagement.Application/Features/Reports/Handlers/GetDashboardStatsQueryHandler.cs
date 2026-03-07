using System;
using System.Threading;
using System.Threading.Tasks;
using HotelManagement.Core.Common.Dtos;
using HotelManagement.Application.Features.Reports.Queries;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Reports.Handlers
{
    public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
    {
        private readonly IReportRepository _reportRepository;

        public GetDashboardStatsQueryHandler(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
        {
            var today = DateTime.Today;
            var firstDayOfMonth = new DateTime(today.Year, today.Month, 1);

            // 1. Total Rooms
            var totalRooms = await _reportRepository.GetTotalRoomsCountAsync(cancellationToken);

            // 2. Available Rooms
            var occupiedRoomsToday = await _reportRepository.GetOccupiedRoomsCountAsync(today, cancellationToken);
            var availableRooms = totalRooms - occupiedRoomsToday;

            // 3. Occupancy Rate
            double occupancyRate = totalRooms > 0 ? (double)occupiedRoomsToday / totalRooms * 100 : 0;

            // 4. Total Bookings
            var totalBookings = await _reportRepository.GetTotalBookingsCountAsync(cancellationToken);

            // 5. Monthly Revenue
            var monthlyRevenue = await _reportRepository.GetRevenueAsync(firstDayOfMonth, today.AddDays(1).AddTicks(-1), cancellationToken);

            return new DashboardStatsDto
            {
                TotalRooms = totalRooms,
                AvailableRooms = availableRooms,
                OccupancyRate = Math.Round(occupancyRate, 2),
                TotalBookings = totalBookings,
                MonthlyRevenue = monthlyRevenue
            };
        }
    }
}
