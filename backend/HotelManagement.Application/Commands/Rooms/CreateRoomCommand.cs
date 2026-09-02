using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Entities;
using MediatR;

namespace HotelManagement.Application.Commands.Rooms;

public record CreateRoomCommand(
    string RoomNumber,
    string RoomType,
    decimal PricePerNight,
    bool IsAvailable = true) : IRequest<RoomDto>;

public class CreateRoomCommandHandler : IRequestHandler<CreateRoomCommand, RoomDto>
{
    private readonly IRoomRepository _roomRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ISignalRNotificationService _signalRService;

    public CreateRoomCommandHandler(
        IRoomRepository roomRepository,
        IAuditLogRepository auditLogRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ISignalRNotificationService signalRService)
    {
        _roomRepository = roomRepository;
        _auditLogRepository = auditLogRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _signalRService = signalRService;
    }

    public async Task<RoomDto> Handle(CreateRoomCommand request, CancellationToken cancellationToken)
    {
        var trimmedNumber = request.RoomNumber.Trim();
        var exists = await _roomRepository.ExistsByRoomNumberAsync(trimmedNumber, null, cancellationToken);

        if (exists)
        {
            throw new ConflictException($"Room number '{request.RoomNumber}' already exists.");
        }

        var room = new Room
        {
            RoomNumber = trimmedNumber,
            RoomType = request.RoomType.Trim(),
            PricePerNight = request.PricePerNight,
            IsAvailable = request.IsAvailable,
            CreatedAt = DateTime.UtcNow
        };

        await _roomRepository.AddAsync(room, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var userId = _currentUserService.UserId ?? 0;
        var auditLog = new AuditLog
        {
            Action = "Created",
            EntityName = "Room",
            EntityId = room.Id.ToString(),
            UserId = userId,
            ActionDate = DateTime.UtcNow,
            Details = $"Created room {room.RoomNumber} ({room.RoomType}) at ${room.PricePerNight}/night"
        };
        await _auditLogRepository.AddAsync(auditLog, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new RoomDto
        {
            Id = room.Id,
            RoomNumber = room.RoomNumber,
            RoomType = room.RoomType,
            PricePerNight = room.PricePerNight,
            IsAvailable = room.IsAvailable,
            CreatedAt = room.CreatedAt
        };

        await _signalRService.NotifyRoomCreated(dto);

        return dto;
    }
}
