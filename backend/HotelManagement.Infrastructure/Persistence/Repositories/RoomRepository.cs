using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class RoomRepository : IRoomRepository
{
    private readonly HotelDbContext _context;

    public RoomRepository(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<Room?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Rooms
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<Room?> GetByIdWithReservationsAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Rooms
            .Include(r => r.Reservations)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByRoomNumberAsync(string roomNumber, int? excludeRoomId = null, CancellationToken cancellationToken = default)
    {
        var trimmed = roomNumber.Trim().ToLower();
        var query = _context.Rooms.AsQueryable();

        if (excludeRoomId.HasValue)
        {
            query = query.Where(r => r.Id != excludeRoomId.Value);
        }

        return await query.AnyAsync(r => r.RoomNumber.ToLower() == trimmed, cancellationToken);
    }

    public async Task<List<Room>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Rooms
            .AsNoTracking()
            .OrderBy(r => r.RoomNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Room>> GetAvailableRoomsAsync(
        string? roomType,
        decimal? minPrice,
        decimal? maxPrice,
        DateOnly? checkIn,
        DateOnly? checkOut,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Rooms.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(roomType))
        {
            var trimmedType = roomType.Trim().ToLower();
            query = query.Where(r => r.RoomType.ToLower() == trimmedType);
        }

        if (minPrice.HasValue)
        {
            query = query.Where(r => r.PricePerNight >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(r => r.PricePerNight <= maxPrice.Value);
        }

        if (checkIn.HasValue && checkOut.HasValue)
        {
            var inDate = checkIn.Value;
            var outDate = checkOut.Value;

            // Half-open interval overlap logic: existing.CheckInDate < requestedCheckOutDate && existing.CheckOutDate > requestedCheckInDate
            query = query.Where(r => !r.Reservations.Any(res =>
                res.Status != ReservationStatus.Cancelled &&
                res.CheckInDate < outDate &&
                res.CheckOutDate > inDate));
        }
        else
        {
            query = query.Where(r => r.IsAvailable);
        }

        return await query
            .OrderBy(r => r.RoomNumber)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Room room, CancellationToken cancellationToken = default)
    {
        await _context.Rooms.AddAsync(room, cancellationToken);
    }

    public void Update(Room room)
    {
        _context.Rooms.Update(room);
    }

    public void Delete(Room room)
    {
        _context.Rooms.Remove(room);
    }

    public async Task<int> CountAsync(bool? onlyAvailable = null, CancellationToken cancellationToken = default)
    {
        var query = _context.Rooms.AsQueryable();
        if (onlyAvailable.HasValue && onlyAvailable.Value)
        {
            query = query.Where(r => r.IsAvailable);
        }
        return await query.CountAsync(cancellationToken);
    }
}
