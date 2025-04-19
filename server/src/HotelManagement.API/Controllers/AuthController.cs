using System.Threading.Tasks;
using HotelManagement.Application.Features.Auth.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginCommand command)
        {
            var response = await _mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);

            return Ok(response);
        }
    }
}