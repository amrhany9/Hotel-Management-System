using HotelManagement.Application.Commands.Reservations;
using HotelManagement.Application.DTOs;
using HotelManagement.Application.Queries.Reservations;
using HotelManagement.Domain.Enums;
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
        [FromQuery] string? guest,
        [FromQuery] string? roomNumber,
        [FromQuery] DateOnly? checkInDate,
        [FromQuery] DateOnly? checkOutDate,
        [FromQuery] string? status,
        CancellationToken cancellationToken)
    {
        var query = new GetReservationsQuery(guest, roomNumber, checkInDate, checkOutDate, status);
        return Ok(await _mediator.Send(query, cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ReservationDetailDto>> GetById(int id, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new GetReservationByIdQuery(id), cancellationToken));
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
    public async Task<ActionResult<ReservationDetailDto>> Cancel(int id, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new CancelReservationCommand(id), cancellationToken));
    }

    [HttpPost("{id:int}/check-in")]
    public async Task<ActionResult<ReservationDetailDto>> CheckIn(int id, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new CheckInReservationCommand(id), cancellationToken));
    }

    [HttpPost("{id:int}/check-out")]
    public async Task<ActionResult<ReservationDetailDto>> CheckOut(int id, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new CheckOutReservationCommand(id), cancellationToken));
    }

    [HttpPost("{id:int}/no-show")]
    public async Task<ActionResult<ReservationDetailDto>> NoShow(int id, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new MarkNoShowCommand(id), cancellationToken));
    }

    [HttpPost("{id:int}/payments")]
    public async Task<ActionResult<ReservationDetailDto>> RecordPayment(
        int id,
        [FromBody] RecordPaymentRequest request,
        CancellationToken cancellationToken)
    {
        var command = new RecordPaymentCommand(id, request.Amount, request.Method, request.Reference);
        return Ok(await _mediator.Send(command, cancellationToken));
    }
}

public record RecordPaymentRequest(decimal Amount, PaymentMethod Method, string? Reference);
