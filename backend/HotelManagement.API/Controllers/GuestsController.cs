using HotelManagement.Application.DTOs;
using HotelManagement.Application.Queries.Guests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class GuestsController : ControllerBase
{
    private readonly IMediator _mediator;

    public GuestsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<GuestDto>>> GetAll([FromQuery] string? search, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new GetGuestsQuery(search), cancellationToken));
    }

    [HttpGet("lookup")]
    public async Task<ActionResult<GuestDto>> Lookup([FromQuery] string phone, CancellationToken cancellationToken)
    {
        var guest = await _mediator.Send(new GetGuestByPhoneQuery(phone), cancellationToken);
        return guest == null ? NoContent() : Ok(guest);
    }
}
