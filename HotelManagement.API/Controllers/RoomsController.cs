using HotelManagement.Application.Features.Rooms.Commands;
using HotelManagement.Application.Features.Rooms.Queries;
using HotelManagement.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RoomsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RoomsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<Room>>> GetRooms()
    {
        return await _mediator.Send(new GetRoomsQuery());
    }

    [HttpPost]
    public async Task<ActionResult<int>> CreateRoom([FromBody] CreateRoomCommand command)
    {
        return await _mediator.Send(command);
    }
}