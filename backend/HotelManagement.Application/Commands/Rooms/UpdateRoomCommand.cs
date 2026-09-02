using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Entities;
using MediatR;

namespace HotelManagement.Application.Commands.Rooms;

public record UpdateRoomCommand(
    int Id,
    string RoomNumber,
    string RoomType,
    decimal PricePerNight,
    bool IsAvailable) : IRequest<RoomDto>;

public class UpdateRoomCommandHandler : IRequestHandler<UpdateRoomCommand, RoomDto>
{
    private readonly IRoomRepository _roomRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ISignalRNotificationService _signalRService;

    public UpdateRoomCommandHandler(
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

    public async Task<RoomDto> Handle(UpdateRoomCommand request, CancellationToken cancellationToken)
    {
        var room = await _roomRepository.GetByIdAsync(request.Id, cancellationToken);

        if (room == null)
        {
            throw new NotFoundException("Room", request.Id);
        }

        var trimmedNumber = request.RoomNumber.Trim();
        var exists = await _roomRepository.ExistsByRoomNumberAsync(trimmedNumber, request.Id, cancellationToken);

        if (exists)
        {
            throw new ConflictException($"Room number '{request.RoomNumber}' is already in use by another room.");
        }

        var oldInfo = $"Room {room.RoomNumber} ({room.RoomType}, ${room.PricePerNight}, Available: {room.IsAvailable})";

        room.RoomNumber = trimmedNumber;
        room.RoomType = request.RoomType.Trim();
        room.PricePerNight = request.PricePerNight;
        room.IsAvailable = request.IsAvailable;

        _roomRepository.Update(room);

        var userId = _currentUserService.UserId ?? 0;
        var auditLog = new AuditLog
        {
            Action = "Updated",
            EntityName = "Room",
            EntityId = room.Id.ToString(),
            UserId = userId,
            ActionDate = DateTime.UtcNow,
            Details = $"Updated room {room.Id}: {oldInfo} -> Room {room.RoomNumber} ({room.RoomType}, ${room.PricePerNight}, Available: {room.IsAvailable})"
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

        await _signalRService.NotifyRoomUpdated(dto);

        return dto;
    }
}
