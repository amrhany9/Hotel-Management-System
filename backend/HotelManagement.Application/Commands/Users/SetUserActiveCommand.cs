using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.Common.Settings;
using HotelManagement.Application.DTOs;
using HotelManagement.Application.Queries.Users;
using HotelManagement.Domain.Entities;
using MediatR;
using Microsoft.Extensions.Options;

namespace HotelManagement.Application.Commands.Users;

public record SetUserActiveCommand(int Id, bool IsActive) : IRequest<UserDto>;

public class SetUserActiveCommandHandler : IRequestHandler<SetUserActiveCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUserService;
    private readonly IClock _clock;
    private readonly DemoSettings _demoSettings;

    public SetUserActiveCommandHandler(
        IUserRepository userRepository,
        IAuditLogRepository auditLogRepository,
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUserService,
        IClock clock,
        IOptions<DemoSettings> demoSettings)
    {
        _userRepository = userRepository;
        _auditLogRepository = auditLogRepository;
        _unitOfWork = unitOfWork;
        _currentUserService = currentUserService;
        _clock = clock;
        _demoSettings = demoSettings.Value;
    }

    public async Task<UserDto> Handle(SetUserActiveCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("User", request.Id);

        var currentUserId = _currentUserService.UserId
            ?? throw new UnauthorizedAccessException("User is not authenticated.");

        if (!request.IsActive && user.Id == currentUserId)
        {
            throw new ConflictException("You can't deactivate your own account.");
        }

        if (!request.IsActive && _demoSettings.Enabled && DemoSettings.ProtectedAccountEmails.Contains(user.Email))
        {
            throw new ConflictException("The demo accounts can't be deactivated, so every visitor can log in.");
        }

        if (user.IsActive == request.IsActive)
        {
            return UserMapping.ToDto(user);
        }

        user.IsActive = request.IsActive;

        await _auditLogRepository.AddAsync(new AuditLog
        {
            Action = request.IsActive ? "Activated" : "Deactivated",
            EntityName = "User",
            EntityId = user.Id.ToString(),
            UserId = currentUserId,
            ActionDate = _clock.UtcNow,
            Details = $"{(request.IsActive ? "Activated" : "Deactivated")} account for '{user.FullName}' ({user.Email})"
        }, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return UserMapping.ToDto(user);
    }
}
