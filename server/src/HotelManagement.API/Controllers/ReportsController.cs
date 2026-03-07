using System.Collections.Generic;
using HotelManagement.Core.Common.Dtos;
using HotelManagement.Application.Features.Reports.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin")]
    public class ReportsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ReportsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("stats")]
        public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
        {
            var stats = await _mediator.Send(new GetDashboardStatsQuery());
            return Ok(stats);
        }

        [HttpGet("revenue-monthly")]
        public async Task<ActionResult<List<MonthlyRevenueDto>>> GetMonthlyRevenue([FromQuery] int months = 6)
        {
            var report = await _mediator.Send(new GetRevenueReportQuery { Months = months });
            return Ok(report);
        }
    }
}
