using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HotelManagement.Core.Common.Dtos;
using HotelManagement.Core.Entities;
using HotelManagement.Core.Interfaces;
using HotelManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly ApplicationDbContext _context;

        public ReportRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> GetTotalRoomsCountAsync(CancellationToken cancellationToken)
        {
            return await _context.Rooms.CountAsync(cancellationToken);
        }

        public async Task<int> GetOccupiedRoomsCountAsync(DateTime date, CancellationToken cancellationToken)
        {
            return await _context.Bookings
                .Where(b => b.Status != BookingStatus.Cancelled &&
                            date >= b.CheckInDate && date < b.CheckOutDate)
                .Select(b => b.RoomId)
                .Distinct()
                .CountAsync(cancellationToken);
        }

        public async Task<int> GetTotalBookingsCountAsync(CancellationToken cancellationToken)
        {
            return await _context.Bookings.CountAsync(cancellationToken);
        }

        public async Task<decimal> GetRevenueAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken)
        {
            return await _context.Bookings
                .Where(b => b.Status != BookingStatus.Cancelled && 
                            b.CheckInDate >= startDate && b.CheckInDate <= endDate)
                .SumAsync(b => b.TotalPrice, cancellationToken);
        }

        public async Task<List<MonthlyRevenueDto>> GetMonthlyRevenueReportAsync(DateTime startDate, int months, CancellationToken cancellationToken)
        {
            var bookings = await _context.Bookings
                .Where(b => b.Status != BookingStatus.Cancelled && b.CheckInDate >= startDate)
                .ToListAsync(cancellationToken);

            var report = bookings
                .GroupBy(b => new DateTime(b.CheckInDate.Year, b.CheckInDate.Month, 1))
                .OrderBy(g => g.Key)
                .Select(g => new MonthlyRevenueDto
                {
                    Month = g.Key.ToString("MMM yyyy"),
                    Revenue = g.Sum(b => b.TotalPrice),
                    BookingCount = g.Count()
                })
                .ToList();

            var result = new List<MonthlyRevenueDto>();
            for (int i = 0; i < months; i++)
            {
                var monthDate = startDate.AddMonths(i);
                var monthStr = monthDate.ToString("MMM yyyy");
                var existing = report.FirstOrDefault(r => r.Month == monthStr);
                
                if (existing != null)
                {
                    result.Add(existing);
                }
                else
                {
                    result.Add(new MonthlyRevenueDto
                    {
                        Month = monthStr,
                        Revenue = 0,
                        BookingCount = 0
                    });
                }
            }

            return result;
        }
    }
}
