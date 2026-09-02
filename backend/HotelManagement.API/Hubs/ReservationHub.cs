using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace HotelManagement.API.Hubs;

[Authorize]
public class ReservationHub : Hub
{
    private readonly ILogger<ReservationHub> _logger;

    public ReservationHub(ILogger<ReservationHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("SignalR Client connected: {ConnectionId}, User: {User}",
            Context.ConnectionId, Context.User?.Identity?.Name ?? "Anonymous");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("SignalR Client disconnected: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
