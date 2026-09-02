using HotelManagement.Domain.Entities;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

public interface IRoomRepository
{
    Task<Room?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Room?> GetByIdWithReservationsAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByRoomNumberAsync(string roomNumber, int? excludeRoomId = null, CancellationToken cancellationToken = default);
    Task<List<Room>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<List<Room>> GetAvailableRoomsAsync(string? roomType, decimal? minPrice, decimal? maxPrice, DateOnly? checkIn, DateOnly? checkOut, CancellationToken cancellationToken = default);
    Task AddAsync(Room room, CancellationToken cancellationToken = default);
    void Update(Room room);
    void Delete(Room room);
    Task<int> CountAsync(bool? onlyAvailable = null, CancellationToken cancellationToken = default);
}
