using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.Common.Mappings;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Services;

public class ReservationChangeRecorder
{
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly ISignalRNotificationService _signalRService;
    private readonly IClock _clock;

    public ReservationChangeRecorder(
        IAuditLogRepository auditLogRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        ISignalRNotificationService signalRService,
        IClock clock)
    {
        _auditLogRepository = auditLogRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _signalRService = signalRService;
        _clock = clock;
    }

    public int CurrentUserId => _currentUserService.UserId
        ?? throw new UnauthorizedAccessException("User is not authenticated.");

    public async Task<ReservationDetailDto> SaveAsync(
        Reservation reservation,
        string action,
        string details,
        CancellationToken cancellationToken)
    {
        await _auditLogRepository.AddAsync(new AuditLog
        {
            Action = action,
            EntityName = "Reservation",
            EntityId = reservation.Id.ToString(),
            UserId = CurrentUserId,
            ActionDate = _clock.UtcNow,
            Details = details
        }, cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = ReservationMapper.ToDetailDto(reservation);
        await _signalRService.NotifyReservationUpdated(dto, action);
        return dto;
    }
}
