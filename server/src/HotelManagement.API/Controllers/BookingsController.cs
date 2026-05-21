using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
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
    /// <summary>
    /// Controller for managing hotel bookings using CQRS and MediatR.
    /// Inherits from ApiControllerBase for unified dependency injection.
    /// </summary>
    public class BookingsController : ApiControllerBase
    {
        /// <summary>
        /// Retrieves all bookings across the system. (Admin only)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<List<BookingDto>>> GetAllBookings()
        {
            var bookings = await Mediator.Send(new GetBookingsListQuery());
            return Ok(bookings);
        }

        /// <summary>
        /// Retrieves bookings within a specific date range.
        /// </summary>
        [HttpGet("range")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<List<BookingDto>>> GetBookingsByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var bookings = await Mediator.Send(new GetBookingsByDateRangeQuery 
            { 
                StartDate = startDate, 
                EndDate = endDate 
            });
            return Ok(bookings);
        }

        /// <summary>
        /// Retrieves the most recent bookings based on the provided count.
        /// </summary>
        [HttpGet("recent")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<List<BookingDto>>> GetRecentBookings([FromQuery] int count = 5)
        {
            var bookings = await Mediator.Send(new GetRecentBookingsQuery { Count = count });
            return Ok(bookings);
        }

        /// <summary>
        /// Retrieves a specific booking along with its details.
        /// </summary>
        [HttpGet("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BookingDto>> GetBookingById(int id)
        {
            var booking = await Mediator.Send(new GetBookingDetailQuery { Id = id });
            if (booking == null)
                return NotFound();

            return Ok(booking);
        }

        /// <summary>
        /// Asserts a new booking into the system. Accessible by public clients.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<BaseResponse>> CreateBooking([FromBody] CreateBookingCommand command)
        {
            var response = await Mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        /// <summary>
        /// Updates the entire entity of an existing booking.
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BaseResponse>> UpdateBooking(int id, [FromBody] UpdateBookingCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest(new BaseResponse { Success = false, Message = "Id mismatch" });
            }
            
            var response = await Mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        /// <summary>
        /// Partially updates a booking's status.
        /// </summary>
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BaseResponse>> UpdateBookingStatus(int id, [FromBody] BookingStatus status)
        {
            var command = new UpdateBookingStatusCommand { Id = id, Status = status };
            var response = await Mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        /// <summary>
        /// Removes a booking from the system.
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BaseResponse>> DeleteBooking(int id)
        {
            var response = await Mediator.Send(new DeleteBookingCommand { Id = id });
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}