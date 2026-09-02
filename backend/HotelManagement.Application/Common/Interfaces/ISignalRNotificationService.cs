using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces;

public interface ISignalRNotificationService
{
    Task NotifyReservationCreated(ReservationDto reservation);
    Task NotifyReservationCancelled(int reservationId);
    Task NotifyRoomCreated(RoomDto room);
    Task NotifyRoomUpdated(RoomDto room);
    Task NotifyRoomDeleted(int roomId);
}
