using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using MediatR;
using ValidationException = HotelManagement.Application.Common.Exceptions.ValidationException;

namespace HotelManagement.Application.Commands.Reservations;

public record CreateReservationCommand(
    int RoomId,
    string GuestName,
    DateOnly CheckInDate,
    DateOnly CheckOutDate) : IRequest<ReservationDto>;

public class CreateReservationCommandHandler : IRequestHandler<CreateReservationCommand, ReservationDto>
{
    private readonly IRoomRepository _roomRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly IUserRepository _userRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ISignalRNotificationService _signalRService;

    public CreateReservationCommandHandler(
        IRoomRepository roomRepository,
        IReservationRepository reservationRepository,
        IUserRepository userRepository,
        IAuditLogRepository auditLogRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ISignalRNotificationService signalRService)
    {
        _roomRepository = roomRepository;
        _reservationRepository = reservationRepository;
        _userRepository = userRepository;
        _auditLogRepository = auditLogRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _signalRService = signalRService;
    }

    public async Task<ReservationDto> Handle(CreateReservationCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId;
        if (!userId.HasValue || userId.Value <= 0)
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        if (request.CheckOutDate <= request.CheckInDate)
        {
            throw new ValidationException("CheckOutDate", "Check-out date must be after check-in date.");
        }

        var resultDto = await _unitOfWork.ExecuteTransactionAsync(async () =>
        {
            // 1. Load the room
            var room = await _roomRepository.GetByIdAsync(request.RoomId, cancellationToken);

            // 2. Verify the room exists
            if (room == null)
            {
                throw new NotFoundException("Room", request.RoomId);
            }

            // 3. Check overlapping non-cancelled reservations
            var hasOverlap = await _reservationRepository.HasOverlapAsync(
                request.RoomId,
                request.CheckInDate,
                request.CheckOutDate,
                null,
                cancellationToken);

            if (hasOverlap)
            {
                throw new ConflictException("The room is already reserved for the selected date range.");
            }

            // 4. Calculate number of nights
            int nights = request.CheckOutDate.DayNumber - request.CheckInDate.DayNumber;

            // 5. Calculate total amount
            decimal totalAmount = nights * room.PricePerNight;

            // 6. Create the reservation
            var reservation = new Reservation
            {
                RoomId = room.Id,
                GuestName = request.GuestName.Trim(),
                CheckInDate = request.CheckInDate,
                CheckOutDate = request.CheckOutDate,
                TotalAmount = totalAmount,
                Status = ReservationStatus.Confirmed,
                CreatedBy = userId.Value,
                CreatedAt = DateTime.UtcNow
            };

            await _reservationRepository.AddAsync(reservation, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 7. Create the AuditLog
            var auditLog = new AuditLog
            {
                Action = "Created",
                EntityName = "Reservation",
                EntityId = reservation.Id.ToString(),
                UserId = userId.Value,
                ActionDate = DateTime.UtcNow,
                Details = $"Created reservation for guest '{reservation.GuestName}' in room {room.RoomNumber} ({reservation.CheckInDate:yyyy-MM-dd} to {reservation.CheckOutDate:yyyy-MM-dd}, {nights} nights, ${totalAmount})"
            };

            await _auditLogRepository.AddAsync(auditLog, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var user = await _userRepository.GetByIdAsync(userId.Value, cancellationToken);

            return new ReservationDto
            {
                Id = reservation.Id,
                RoomId = room.Id,
                RoomNumber = room.RoomNumber,
                RoomType = room.RoomType,
                GuestName = reservation.GuestName,
                CheckInDate = reservation.CheckInDate,
                CheckOutDate = reservation.CheckOutDate,
                Nights = nights,
                TotalAmount = reservation.TotalAmount,
                Status = reservation.Status.ToString(),
                CreatedBy = reservation.CreatedBy,
                CreatedByName = user?.FullName ?? $"User #{reservation.CreatedBy}",
                CreatedAt = reservation.CreatedAt
            };
        }, cancellationToken);

        // Broadcast SignalR event strictly after commit
        await _signalRService.NotifyReservationCreated(resultDto);

        return resultDto;
    }
}
