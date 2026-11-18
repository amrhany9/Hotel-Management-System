using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using HotelManagement.Application.Queries.Users;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using MediatR;

namespace HotelManagement.Application.Commands.Users;

public record CreateUserCommand(string FullName, string Email, string Password, UserRole Role) : IRequest<UserDto>;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IAuditLogRepository _auditLogRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly ICurrentUserService _currentUserService;
    private readonly IClock _clock;

    public CreateUserCommandHandler(
        IUserRepository userRepository,
        IAuditLogRepository auditLogRepository,
        IUnitOfWork unitOfWork,
        IPasswordHasherService passwordHasher,
        ICurrentUserService currentUserService,
        IClock clock)
    {
        _userRepository = userRepository;
        _auditLogRepository = auditLogRepository;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _currentUserService = currentUserService;
        _clock = clock;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await _userRepository.ExistsByEmailAsync(email, cancellationToken))
        {
            throw new ConflictException($"A staff account with the email '{email}' already exists.");
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = email,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            Role = request.Role,
            IsActive = true,
            CreatedAt = _clock.UtcNow
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _auditLogRepository.AddAsync(new AuditLog
        {
            Action = "Created",
            EntityName = "User",
            EntityId = user.Id.ToString(),
            UserId = _currentUserService.UserId ?? user.Id,
            ActionDate = _clock.UtcNow,
            Details = $"Created {user.Role} account for '{user.FullName}' ({user.Email})"
        }, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return UserMapping.ToDto(user);
    }
}
