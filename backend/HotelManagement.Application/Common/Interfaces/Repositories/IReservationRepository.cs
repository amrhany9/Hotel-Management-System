using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

public interface IReservationRepository
{
    Task<Reservation?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<List<Reservation>> SearchAsync(string? guestName, string? roomNumber, DateOnly? checkInDate, DateOnly? checkOutDate, ReservationStatus? status, CancellationToken cancellationToken = default);
    Task<bool> HasOverlapAsync(int roomId, DateOnly checkInDate, DateOnly checkOutDate, int? excludeReservationId = null, CancellationToken cancellationToken = default);
    Task AddAsync(Reservation reservation, CancellationToken cancellationToken = default);
    void Update(Reservation reservation);
    void RemoveRange(IEnumerable<Reservation> reservations);
    Task<int> CountAsync(ReservationStatus? status = null, CancellationToken cancellationToken = default);
    Task<List<Reservation>> GetActiveReservationsInRangeAsync(DateOnly from, DateOnly to, CancellationToken cancellationToken = default);
}
