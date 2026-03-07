using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using HotelManagement.Core.Common.Dtos;
using HotelManagement.Application.Features.Reports.Queries;
using HotelManagement.Core.Interfaces;
using MediatR;

namespace HotelManagement.Application.Features.Reports.Handlers
{
    public class GetRevenueReportQueryHandler : IRequestHandler<GetRevenueReportQuery, List<MonthlyRevenueDto>>
    {
        private readonly IReportRepository _reportRepository;

        public GetRevenueReportQueryHandler(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        public async Task<List<MonthlyRevenueDto>> Handle(GetRevenueReportQuery request, CancellationToken cancellationToken)
        {
            var startDate = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1).AddMonths(-request.Months + 1);

            return await _reportRepository.GetMonthlyRevenueReportAsync(startDate, request.Months, cancellationToken);
        }
    }
}
