using System.Collections.Generic;
using System.Threading.Tasks;
using HotelManagement.Application.Features.Common;
using HotelManagement.Application.Features.Rooms.Commands;
using HotelManagement.Application.Features.Rooms.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers
{
    /// <summary>
    /// Controller for managing hotel rooms, providing modern CQRS pattern via MediatR.
    /// Inherits from ApiControllerBase for standardized responses.
    /// </summary>
    public class RoomsController : ApiControllerBase
    {
        /// <summary>
        /// Retrieves a comprehensive list of all rooms in the hotel.
        /// </summary>
        /// <returns>A list of RoomDto objects representing all available and unavailable rooms.</returns>
        [HttpGet]
        public async Task<ActionResult<List<RoomDto>>> GetAllRooms()
        {
            var rooms = await Mediator.Send(new GetRoomsListQuery());
            return Ok(rooms);
        }

        /// <summary>
        /// Finds available rooms based on check-in/out dates and capacity requirements.
        /// </summary>
        [HttpGet("available")]
        public async Task<ActionResult<List<RoomDto>>> GetAvailableRooms([FromQuery] DateTime checkInDate, [FromQuery] DateTime checkOutDate, [FromQuery] int? adults, [FromQuery] int? children)
        {
            var query = new GetAvailableRoomsQuery
            {
                CheckInDate = checkInDate,
                CheckOutDate = checkOutDate,
                Adults = adults,
                Children = children
            };
            var rooms = await Mediator.Send(query);
            return Ok(rooms);
        }

        /// <summary>
        /// Retrieves detailed information for a specific room by its ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<RoomDto>> GetRoomById(int id)
        {
            var room = await Mediator.Send(new GetRoomDetailQuery { Id = id });
            if (room == null)
                return NotFound();

            return Ok(room);
        }

        /// <summary>
        /// Creates a new room in the system. Requires Admin privileges.
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BaseResponse>> CreateRoom(CreateRoomCommand command)
        {
            var response = await Mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        /// <summary>
        /// Updates an existing room's details. Requires Admin privileges.
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BaseResponse>> UpdateRoom(int id, UpdateRoomCommand command)
        {
            command.Id = id;
            var response = await Mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        /// <summary>
        /// Deletes a room from the system. Requires Admin privileges.
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BaseResponse>> DeleteRoom(int id)
        {
            var response = await Mediator.Send(new DeleteRoomCommand { Id = id });
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}