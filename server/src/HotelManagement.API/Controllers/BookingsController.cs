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
        public async Task<ActionResult<BaseResponse>> CreateBooking([FromBody] JsonElement requestData)
        {
            try
            {
                var command = new CreateBookingCommand
                {
                    RoomId = requestData.TryGetProperty("roomId", out var roomIdProp) && roomIdProp.TryGetInt32(out var roomId) 
                        ? roomId : 0,
                    
                    GuestName = requestData.TryGetProperty("guestName", out var guestNameProp) && guestNameProp.ValueKind == JsonValueKind.String 
                        ? guestNameProp.GetString() : "",
                    
                    GuestEmail = requestData.TryGetProperty("guestEmail", out var guestEmailProp) && guestEmailProp.ValueKind == JsonValueKind.String 
                        ? guestEmailProp.GetString() : "",
                    
                    GuestPhone = requestData.TryGetProperty("guestPhone", out var guestPhoneProp) && guestPhoneProp.ValueKind == JsonValueKind.String 
                        ? guestPhoneProp.GetString() : "",
                    
                    CheckInDate = requestData.TryGetProperty("checkInDate", out var checkInDateProp) && checkInDateProp.TryGetDateTime(out var checkInDate) 
                        ? checkInDate : DateTime.Now,
                    
                    CheckOutDate = requestData.TryGetProperty("checkOutDate", out var checkOutDateProp) && checkOutDateProp.TryGetDateTime(out var checkOutDate) 
                        ? checkOutDate : DateTime.Now.AddDays(1),
                    
                    NumberOfGuests = requestData.TryGetProperty("numberOfGuests", out var numberOfGuestsProp) && numberOfGuestsProp.TryGetInt32(out var numberOfGuests) 
                        ? numberOfGuests : 1,
                    
                    TotalPrice = requestData.TryGetProperty("totalPrice", out var totalPriceProp) && totalPriceProp.TryGetDecimal(out var totalPrice) 
                        ? totalPrice : 0,
                    
                    SpecialRequests = requestData.TryGetProperty("specialRequests", out var specialRequestsProp) && specialRequestsProp.ValueKind == JsonValueKind.String 
                        ? specialRequestsProp.GetString() : "",
                };

                // Handle status enum conversion with case-insensitive matching
                if (requestData.TryGetProperty("status", out var statusProp) && statusProp.ValueKind == JsonValueKind.String)
                {
                    var statusString = statusProp.GetString();
                    if (!string.IsNullOrEmpty(statusString))
                    {
                        // Case-insensitive parsing for enum
                        if (Enum.TryParse<BookingStatus>(statusString, true, out var statusEnum))
                        {
                            command.Status = statusEnum;
                        }
                    }
                }

                var response = await _mediator.Send(command);
                if (!response.Success)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new BaseResponse 
                { 
                    Success = false, 
                    Message = "Error processing booking", 
                    Errors = new List<string> { ex.Message } 
                });
            }
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