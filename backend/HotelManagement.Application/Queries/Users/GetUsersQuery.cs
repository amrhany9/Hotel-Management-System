using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Entities;
using MediatR;

namespace HotelManagement.Application.Queries.Users;

public record GetUsersQuery : IRequest<List<UserDto>>;

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, List<UserDto>>
{
    private readonly IUserRepository _userRepository;

    public GetUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<UserDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var users = await _userRepository.GetAllAsync(cancellationToken);
        return users.Select(UserMapping.ToDto).ToList();
    }
}

public static class UserMapping
{
    public static UserDto ToDto(User user) => new()
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email,
        Role = user.Role.ToString(),
        IsActive = user.IsActive,
        CreatedAt = user.CreatedAt
    };
}
