using HotelManagement.Application.Commands.Users;
using HotelManagement.Application.DTOs;
using HotelManagement.Application.Queries.Users;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly IMediator _mediator;

    public UsersController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new GetUsersQuery(), cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> Create([FromBody] CreateUserCommand command, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<UserDto>> SetStatus(int id, [FromBody] SetUserStatusRequest request, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new SetUserActiveCommand(id, request.IsActive), cancellationToken));
    }
}

public record SetUserStatusRequest(bool IsActive);
