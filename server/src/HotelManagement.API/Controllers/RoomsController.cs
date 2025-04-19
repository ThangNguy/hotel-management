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
    [ApiController]
    [Route("api/[controller]")]
    public class RoomsController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RoomsController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<List<RoomDto>>> GetAllRooms()
        {
            var rooms = await _mediator.Send(new GetRoomsListQuery());
            return Ok(rooms);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<RoomDto>> GetRoomById(int id)
        {
            var room = await _mediator.Send(new GetRoomDetailQuery { Id = id });
            if (room == null)
                return NotFound();

            return Ok(room);
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BaseResponse>> CreateRoom(CreateRoomCommand command)
        {
            var response = await _mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BaseResponse>> UpdateRoom(int id, UpdateRoomCommand command)
        {
            command.Id = id;
            var response = await _mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<BaseResponse>> DeleteRoom(int id)
        {
            var response = await _mediator.Send(new DeleteRoomCommand { Id = id });
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}