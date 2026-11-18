using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class ReservationRepository : IReservationRepository
{
    private readonly HotelDbContext _context;

    public ReservationRepository(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<Reservation?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Reservations
            .Include(r => r.Room)
            .Include(r => r.Guest)
            .Include(r => r.User)
            .Include(r => r.Payments)
                .ThenInclude(p => p.ReceivedByUser)
            .AsSplitQuery()
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<List<Reservation>> SearchAsync(
        string? guest,
        string? roomNumber,
        DateOnly? checkInDate,
        DateOnly? checkOutDate,
        ReservationStatus? status,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Reservations
            .Include(r => r.Room)
            .Include(r => r.Guest)
            .Include(r => r.User)
            .Include(r => r.Payments)
            .AsSplitQuery()
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(guest))
        {
            var nameFilter = guest.Trim().ToLower();
            var phoneFilter = PhoneNumber.Normalize(guest);
            query = phoneFilter.Length >= 3
                ? query.Where(r => r.Guest.FullName.ToLower().Contains(nameFilter) || r.Guest.Phone.Contains(phoneFilter))
                : query.Where(r => r.Guest.FullName.ToLower().Contains(nameFilter));
        }

        if (!string.IsNullOrWhiteSpace(roomNumber))
        {
            var roomFilter = roomNumber.Trim().ToLower();
            query = query.Where(r => r.Room.RoomNumber.ToLower().Contains(roomFilter));
        }

        if (checkInDate.HasValue)
        {
            query = query.Where(r => r.CheckInDate >= checkInDate.Value);
        }

        if (checkOutDate.HasValue)
        {
            query = query.Where(r => r.CheckOutDate <= checkOutDate.Value);
        }

        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }

        return await query
            .OrderByDescending(r => r.CheckInDate)
            .ThenByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> HasOverlapAsync(
        int roomId,
        DateOnly checkInDate,
        DateOnly checkOutDate,
        int? excludeReservationId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Reservations
            .Where(r => r.RoomId == roomId &&
                        (r.Status == ReservationStatus.Confirmed || r.Status == ReservationStatus.CheckedIn));

        if (excludeReservationId.HasValue)
        {
            query = query.Where(r => r.Id != excludeReservationId.Value);
        }

        return await query.AnyAsync(r =>
            r.CheckInDate < checkOutDate &&
            r.CheckOutDate > checkInDate,
            cancellationToken);
    }

    public async Task AddAsync(Reservation reservation, CancellationToken cancellationToken = default)
    {
        await _context.Reservations.AddAsync(reservation, cancellationToken);
    }

    public void RemoveRange(IEnumerable<Reservation> reservations)
    {
        _context.Reservations.RemoveRange(reservations);
    }

    public async Task<int> CountAsync(ReservationStatus? status = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Reservations.AsQueryable();
        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }
        return await query.CountAsync(cancellationToken);
    }
}
