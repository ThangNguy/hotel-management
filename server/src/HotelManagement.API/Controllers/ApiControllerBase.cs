using HotelManagement.Core.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

/// <summary>
/// Base class for all API controllers providing centralized MediatR injection 
/// and standardizing HTTP responses based on the abstract Result pattern.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    private IMediator? _mediator;

    /// <summary>
    /// Gets the MediatR instance from the dependency injection container safely.
    /// </summary>
    protected IMediator Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<IMediator>();

    /// <summary>
    /// Standardizes the translation of domain Result objects into matching HTTP Status Codes.
    /// </summary>
    protected ActionResult HandleResult<T>(Result<T> result)
    {
        if (result.IsSuccess)
        {
            if (result.Value == null)
                return NotFound();
                
            return Ok(result.Value);
        }

        return result.ErrorType switch
        {
            ResultErrorType.NotFound => NotFound(new { error = result.Error }),
            ResultErrorType.Unauthorized => Unauthorized(new { error = result.Error }),
            ResultErrorType.Conflict => Conflict(new { error = result.Error }),
            _ => BadRequest(new { error = result.Error })
        };
    }
}
