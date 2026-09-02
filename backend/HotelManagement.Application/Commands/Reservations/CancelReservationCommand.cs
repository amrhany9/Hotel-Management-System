using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using MediatR;

namespace HotelManagement.Application.Commands.Reservations;

public record CancelReservationCommand(int Id) : IRequest<ReservationDto>;

public class CancelReservationCommandHandler : IRequestHandler<CancelReservationCommand, ReservationDto>
{
    private readonly IReservationRepository _reservationRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ISignalRNotificationService _signalRService;

    public CancelReservationCommandHandler(
        IReservationRepository reservationRepository,
        IAuditLogRepository auditLogRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ISignalRNotificationService signalRService)
    {
        _reservationRepository = reservationRepository;
        _auditLogRepository = auditLogRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _signalRService = signalRService;
    }

    public async Task<ReservationDto> Handle(CancelReservationCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId ?? 0;

        var reservation = await _reservationRepository.GetByIdAsync(request.Id, cancellationToken);

        if (reservation == null)
        {
            throw new NotFoundException("Reservation", request.Id);
        }

        if (reservation.Status == ReservationStatus.Cancelled)
        {
            throw new ConflictException("Reservation is already cancelled.");
        }

        reservation.Status = ReservationStatus.Cancelled;
        _reservationRepository.Update(reservation);

        var auditLog = new AuditLog
        {
            Action = "Cancelled",
            EntityName = "Reservation",
            EntityId = reservation.Id.ToString(),
            UserId = userId,
            ActionDate = DateTime.UtcNow,
            Details = $"Cancelled reservation #{reservation.Id} for guest '{reservation.GuestName}' (Room {reservation.Room.RoomNumber})"
        };
        await _auditLogRepository.AddAsync(auditLog, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        int nights = reservation.CheckOutDate.DayNumber - reservation.CheckInDate.DayNumber;
        var dto = new ReservationDto
        {
            Id = reservation.Id,
            RoomId = reservation.RoomId,
            RoomNumber = reservation.Room.RoomNumber,
            RoomType = reservation.Room.RoomType,
            GuestName = reservation.GuestName,
            CheckInDate = reservation.CheckInDate,
            CheckOutDate = reservation.CheckOutDate,
            Nights = nights,
            TotalAmount = reservation.TotalAmount,
            Status = reservation.Status.ToString(),
            CreatedBy = reservation.CreatedBy,
            CreatedByName = reservation.User?.FullName ?? $"User #{reservation.CreatedBy}",
            CreatedAt = reservation.CreatedAt
        };

        await _signalRService.NotifyReservationCancelled(reservation.Id);

        return dto;
    }
}
