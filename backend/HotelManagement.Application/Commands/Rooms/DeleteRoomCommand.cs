using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using MediatR;

namespace HotelManagement.Application.Commands.Rooms;

public record DeleteRoomCommand(int Id) : IRequest<Unit>;

public class DeleteRoomCommandHandler : IRequestHandler<DeleteRoomCommand, Unit>
{
    private readonly IRoomRepository _roomRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ISignalRNotificationService _signalRService;

    public DeleteRoomCommandHandler(
        IRoomRepository roomRepository,
        IReservationRepository reservationRepository,
        IAuditLogRepository auditLogRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ISignalRNotificationService signalRService)
    {
        _roomRepository = roomRepository;
        _reservationRepository = reservationRepository;
        _auditLogRepository = auditLogRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _signalRService = signalRService;
    }

    public async Task<Unit> Handle(DeleteRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _roomRepository.GetByIdWithReservationsAsync(request.Id, cancellationToken);

        if (room == null)
        {
            throw new NotFoundException("Room", request.Id);
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var hasFutureConfirmed = room.Reservations.Any(r =>
            r.Status == ReservationStatus.Confirmed && r.CheckOutDate >= today);

        if (hasFutureConfirmed)
        {
            throw new ConflictException("Cannot delete room with active or future confirmed reservations.");
        }

        var roomNumber = room.RoomNumber;

        if (room.Reservations.Any())
        {
            _reservationRepository.RemoveRange(room.Reservations);
        }

        _roomRepository.Delete(room);

        var userId = _currentUserService.UserId ?? 0;
        var auditLog = new AuditLog
        {
            Action = "Deleted",
            EntityName = "Room",
            EntityId = request.Id.ToString(),
            UserId = userId,
            ActionDate = DateTime.UtcNow,
            Details = $"Deleted room {roomNumber} (ID: {request.Id})"
        };
        await _auditLogRepository.AddAsync(auditLog, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _signalRService.NotifyRoomDeleted(request.Id);

        return Unit.Value;
    }
}
