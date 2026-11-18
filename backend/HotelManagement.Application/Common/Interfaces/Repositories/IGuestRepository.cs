using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

public interface IGuestRepository
{
    Task<Guest?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Guest?> GetByPhoneAsync(string phone, CancellationToken cancellationToken = default);
    Task<List<Guest>> SearchAsync(string? search, CancellationToken cancellationToken = default);
    Task AddAsync(Guest guest, CancellationToken cancellationToken = default);
}
