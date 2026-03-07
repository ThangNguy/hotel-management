using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using HotelManagement.Core.Common.Dtos;

namespace HotelManagement.Core.Interfaces
{
    public interface IReportRepository
    {
        Task<int> GetTotalRoomsCountAsync(CancellationToken cancellationToken);
        Task<int> GetOccupiedRoomsCountAsync(DateTime date, CancellationToken cancellationToken);
        Task<int> GetTotalBookingsCountAsync(CancellationToken cancellationToken);
        Task<decimal> GetRevenueAsync(DateTime startDate, DateTime endDate, CancellationToken cancellationToken);
        Task<List<MonthlyRevenueDto>> GetMonthlyRevenueReportAsync(DateTime startDate, int months, CancellationToken cancellationToken);
    }
}
