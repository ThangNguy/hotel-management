using System.Collections.Generic;
using HotelManagement.Core.Common.Dtos;
using MediatR;

namespace HotelManagement.Application.Features.Reports.Queries
{
    public class GetRevenueReportQuery : IRequest<List<MonthlyRevenueDto>>
    {
        public int Months { get; set; } = 6;
    }
}
