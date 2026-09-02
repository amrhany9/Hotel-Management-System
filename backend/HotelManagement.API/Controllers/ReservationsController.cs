using HotelManagement.Application.Commands.Reservations;
using HotelManagement.Application.DTOs;
using HotelManagement.Application.Queries.Reservations;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReservationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReservationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<ReservationDto>>> GetAll(
        [FromQuery] string? guestName,
        [FromQuery] string? roomNumber,
        [FromQuery] DateOnly? checkInDate,
        [FromQuery] DateOnly? checkOutDate,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var query = new GetReservationsQuery(guestName, roomNumber, checkInDate, checkOutDate, status);
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ReservationDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetReservationByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ReservationDto>> Create(
        [FromBody] CreateReservationCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<ReservationDto>> Cancel(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CancelReservationCommand(id), cancellationToken);
        return Ok(result);
    }
}
