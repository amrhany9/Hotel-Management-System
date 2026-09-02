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
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<List<Reservation>> SearchAsync(
        string? guestName,
        string? roomNumber,
        DateOnly? checkInDate,
        DateOnly? checkOutDate,
        ReservationStatus? status,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Reservations
            .Include(r => r.Room)
            .Include(r => r.User)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(guestName))
        {
            var guestFilter = guestName.Trim().ToLower();
            query = query.Where(r => r.GuestName.ToLower().Contains(guestFilter));
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
            .OrderByDescending(r => r.CreatedAt)
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
            .Where(r => r.RoomId == roomId && r.Status != ReservationStatus.Cancelled);

        if (excludeReservationId.HasValue)
        {
            query = query.Where(r => r.Id != excludeReservationId.Value);
        }

        // Standard half-open interval overlap check
        return await query.AnyAsync(r =>
            r.CheckInDate < checkOutDate &&
            r.CheckOutDate > checkInDate,
            cancellationToken);
    }

    public async Task AddAsync(Reservation reservation, CancellationToken cancellationToken = default)
    {
        await _context.Reservations.AddAsync(reservation, cancellationToken);
    }

    public void Update(Reservation reservation)
    {
        _context.Reservations.Update(reservation);
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

    public async Task<List<Reservation>> GetActiveReservationsInRangeAsync(DateOnly from, DateOnly to, CancellationToken cancellationToken = default)
    {
        return await _context.Reservations
            .Include(r => r.Room)
            .AsNoTracking()
            .Where(r => r.Status != ReservationStatus.Cancelled &&
                        r.CheckInDate < to &&
                        r.CheckOutDate > from)
            .ToListAsync(cancellationToken);
    }
}
