using HotelManagement.Application.Commands.Rooms;
using HotelManagement.Application.DTOs;
using HotelManagement.Application.Queries.Rooms;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RoomsController : ControllerBase
{
    private readonly IMediator _mediator;

    public RoomsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<List<RoomDto>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetRoomsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("available")]
    public async Task<ActionResult<List<RoomDto>>> GetAvailable(
        [FromQuery] string? roomType,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] DateOnly? checkIn,
        [FromQuery] DateOnly? checkOut,
        CancellationToken cancellationToken)
    {
        var query = new GetAvailableRoomsQuery(roomType, minPrice, maxPrice, checkIn, checkOut);
        var result = await _mediator.Send(query, cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<RoomDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetRoomByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<RoomDto>> Create(
        [FromBody] CreateRoomCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<RoomDto>> Update(
        int id,
        [FromBody] UpdateRoomCommand command,
        CancellationToken cancellationToken)
    {
        if (id != command.Id)
        {
            return BadRequest(new { title = "Bad Request", detail = "Route ID does not match request body ID." });
        }

        var result = await _mediator.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeleteRoomCommand(id), cancellationToken);
        return NoContent();
    }
}
