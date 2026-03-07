using HotelManagement.Core.Common.Dtos;
using MediatR;

namespace HotelManagement.Application.Features.Reports.Queries
{
    public class GetDashboardStatsQuery : IRequest<DashboardStatsDto>
    {
    }
}
