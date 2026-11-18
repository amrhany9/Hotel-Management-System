using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces;

public interface ISignalRNotificationService
{
    Task NotifyReservationCreated(ReservationDto reservation);
    Task NotifyReservationUpdated(ReservationDto reservation, string action);
    Task NotifyRoomCreated(RoomDto room);
    Task NotifyRoomUpdated(RoomDto room);
    Task NotifyRoomDeleted(int roomId);
}
