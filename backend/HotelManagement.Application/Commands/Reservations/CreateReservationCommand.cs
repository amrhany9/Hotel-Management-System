using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.Common.Mappings;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using MediatR;
using ValidationException = HotelManagement.Application.Common.Exceptions.ValidationException;

namespace HotelManagement.Application.Commands.Reservations;

public record CreateReservationCommand(
    int RoomId,
    string GuestName,
    string GuestPhone,
    string? GuestEmail,
    string? GuestIdNumber,
    DateOnly CheckInDate,
    DateOnly CheckOutDate,
    string? Notes) : IRequest<ReservationDto>;

public class CreateReservationCommandHandler : IRequestHandler<CreateReservationCommand, ReservationDto>
{
    private readonly IRoomRepository _roomRepository;
    private readonly IReservationRepository _reservationRepository;
    private readonly IGuestRepository _guestRepository;
    private readonly IUserRepository _userRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ISignalRNotificationService _signalRService;
    private readonly IClock _clock;

    public CreateReservationCommandHandler(
        IRoomRepository roomRepository,
        IReservationRepository reservationRepository,
        IGuestRepository guestRepository,
        IUserRepository userRepository,
        IAuditLogRepository auditLogRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ISignalRNotificationService signalRService,
        IClock clock)
    {
        _roomRepository = roomRepository;
        _reservationRepository = reservationRepository;
        _guestRepository = guestRepository;
        _userRepository = userRepository;
        _auditLogRepository = auditLogRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _signalRService = signalRService;
        _clock = clock;
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

        if (request.CheckInDate < _clock.Today)
        {
            throw new ValidationException("CheckInDate", "Check-in date can't be in the past.");
        }

        var resultDto = await _unitOfWork.ExecuteTransactionAsync(async () =>
        {
            var room = await _roomRepository.GetByIdAsync(request.RoomId, cancellationToken)
                ?? throw new NotFoundException("Room", request.RoomId);

            if (!room.IsAvailable)
            {
                throw new ConflictException($"Room {room.RoomNumber} is out of service and can't be booked.");
            }

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

            var guest = await UpsertGuestAsync(request, cancellationToken);

            int nights = request.CheckOutDate.DayNumber - request.CheckInDate.DayNumber;
            var reservation = new Reservation
            {
                RoomId = room.Id,
                Room = room,
                Guest = guest,
                CheckInDate = request.CheckInDate,
                CheckOutDate = request.CheckOutDate,
                NightlyRate = room.PricePerNight,
                TotalAmount = nights * room.PricePerNight,
                Status = ReservationStatus.Confirmed,
                Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
                CreatedBy = userId.Value,
                CreatedAt = _clock.UtcNow
            };

            await _reservationRepository.AddAsync(reservation, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            await _auditLogRepository.AddAsync(new AuditLog
            {
                Action = "Created",
                EntityName = "Reservation",
                EntityId = reservation.Id.ToString(),
                UserId = userId.Value,
                ActionDate = _clock.UtcNow,
                Details = $"Created reservation for guest '{guest.FullName}' in room {room.RoomNumber} ({reservation.CheckInDate:yyyy-MM-dd} to {reservation.CheckOutDate:yyyy-MM-dd}, {nights} nights, {Money.Format(reservation.TotalAmount)})"
            }, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            reservation.User = (await _userRepository.GetByIdAsync(userId.Value, cancellationToken))!;
            return ReservationMapper.ToDto(reservation);
        }, cancellationToken);

        await _signalRService.NotifyReservationCreated(resultDto);

        return resultDto;
    }

    private async Task<Guest> UpsertGuestAsync(CreateReservationCommand request, CancellationToken cancellationToken)
    {
        var phone = PhoneNumber.Normalize(request.GuestPhone);
        var email = string.IsNullOrWhiteSpace(request.GuestEmail) ? null : request.GuestEmail.Trim().ToLowerInvariant();
        var idNumber = string.IsNullOrWhiteSpace(request.GuestIdNumber) ? null : request.GuestIdNumber.Trim();

        var guest = await _guestRepository.GetByPhoneAsync(phone, cancellationToken);
        if (guest == null)
        {
            guest = new Guest
            {
                FullName = request.GuestName.Trim(),
                Phone = phone,
                Email = email,
                IdNumber = idNumber,
                CreatedAt = _clock.UtcNow
            };
            await _guestRepository.AddAsync(guest, cancellationToken);
            return guest;
        }

        guest.FullName = request.GuestName.Trim();
        guest.Email = email ?? guest.Email;
        guest.IdNumber = idNumber ?? guest.IdNumber;
        return guest;
    }
}
