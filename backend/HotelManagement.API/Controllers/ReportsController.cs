using HotelManagement.Application.DTOs;
using HotelManagement.Application.Queries.Reports;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HotelManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("top-rooms")]
    public async Task<ActionResult<List<TopRoomReportDto>>> GetTopRooms(
        [FromQuery] int take = 5,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetTopRoomsReportQuery(take), cancellationToken);
        return Ok(result);
    }

    [HttpGet("revenue")]
    public async Task<ActionResult<RevenueReportDto>> GetRevenue(
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetRevenueReportQuery(from, to), cancellationToken);
        return Ok(result);
    }

    [HttpGet("occupancy")]
    public async Task<ActionResult<List<OccupancyReportItemDto>>> GetOccupancy(
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetOccupancyReportQuery(from, to), cancellationToken);
        return Ok(result);
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats(CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetDashboardStatsQuery(), cancellationToken);
        return Ok(result);
    }
}
