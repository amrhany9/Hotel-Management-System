using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.DTOs;
using Microsoft.AspNetCore.SignalR;

namespace HotelManagement.API.Hubs;

public class SignalRNotificationService : ISignalRNotificationService
{
    private readonly IHubContext<ReservationHub> _hubContext;
    private readonly ILogger<SignalRNotificationService> _logger;

    public SignalRNotificationService(
        IHubContext<ReservationHub> hubContext,
        ILogger<SignalRNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyReservationCreated(ReservationDto reservation)
    {
        try
        {
            _logger.LogInformation("Broadcasting reservationCreated event for ID: {Id}", reservation.Id);
            await _hubContext.Clients.All.SendAsync("reservationCreated", reservation);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast reservationCreated event");
        }
    }

    public async Task NotifyReservationCancelled(int reservationId)
    {
        try
        {
            _logger.LogInformation("Broadcasting reservationCancelled event for ID: {Id}", reservationId);
            await _hubContext.Clients.All.SendAsync("reservationCancelled", reservationId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast reservationCancelled event");
        }
    }

    public async Task NotifyRoomCreated(RoomDto room)
    {
        try
        {
            _logger.LogInformation("Broadcasting roomCreated event for ID: {Id}", room.Id);
            await _hubContext.Clients.All.SendAsync("roomCreated", room);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast roomCreated event");
        }
    }

    public async Task NotifyRoomUpdated(RoomDto room)
    {
        try
        {
            _logger.LogInformation("Broadcasting roomUpdated event for ID: {Id}", room.Id);
            await _hubContext.Clients.All.SendAsync("roomUpdated", room);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast roomUpdated event");
        }
    }

    public async Task NotifyRoomDeleted(int roomId)
    {
        try
        {
            _logger.LogInformation("Broadcasting roomDeleted event for ID: {Id}", roomId);
            await _hubContext.Clients.All.SendAsync("roomDeleted", roomId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to broadcast roomDeleted event");
        }
    }
}
