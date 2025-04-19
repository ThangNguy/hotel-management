using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Application.Features.Bookings.Commands;
using HotelManagement.Application.Features.Bookings.Queries;
using HotelManagement.Application.Features.Common;
using HotelManagement.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public BookingsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<List<BookingDto>>> GetAllBookings()
        {
            var bookings = await _mediator.Send(new GetBookingsListQuery());
            return Ok(bookings);
        }

        [HttpGet("recent")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<List<BookingDto>>> GetRecentBookings([FromQuery] int count = 5)
        {
            var bookings = await _mediator.Send(new GetRecentBookingsQuery { Count = count });
            return Ok(bookings);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BookingDto>> GetBookingById(int id)
        {
            var booking = await _mediator.Send(new GetBookingDetailQuery { Id = id });
            if (booking == null)
                return NotFound();

            return Ok(booking);
        }

        [HttpPost]
        public async Task<ActionResult<BaseResponse>> CreateBooking(CreateBookingCommand command)
        {
            var response = await _mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BaseResponse>> UpdateBooking(int id, UpdateBookingCommand command)
        {
            command.Id = id;
            var response = await _mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPatch("{id}/status")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BaseResponse>> UpdateBookingStatus(int id, [FromBody] BookingStatus status)
        {
            var command = new UpdateBookingStatusCommand { Id = id, Status = status };
            var response = await _mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BaseResponse>> DeleteBooking(int id)
        {
            var response = await _mediator.Send(new DeleteBookingCommand { Id = id });
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}