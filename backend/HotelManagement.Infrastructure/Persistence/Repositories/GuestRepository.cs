using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class GuestRepository : IGuestRepository
{
    private readonly HotelDbContext _context;

    public GuestRepository(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<Guest?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Guests.FirstOrDefaultAsync(g => g.Id == id, cancellationToken);
    }

    public async Task<Guest?> GetByPhoneAsync(string phone, CancellationToken cancellationToken = default)
    {
        var normalized = PhoneNumber.Normalize(phone);
        if (normalized.Length == 0)
        {
            return null;
        }

        return await _context.Guests
            .Include(g => g.Reservations)
                .ThenInclude(r => r.Payments)
            .AsSplitQuery()
            .FirstOrDefaultAsync(g => g.Phone == normalized, cancellationToken);
    }

    public async Task<List<Guest>> SearchAsync(string? search, CancellationToken cancellationToken = default)
    {
        var query = _context.Guests
            .Include(g => g.Reservations)
                .ThenInclude(r => r.Payments)
            .AsSplitQuery()
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var text = search.Trim().ToLower();
            var phone = PhoneNumber.Normalize(search);
            query = phone.Length >= 3
                ? query.Where(g => g.FullName.ToLower().Contains(text) || g.Phone.Contains(phone) || (g.Email != null && g.Email.Contains(text)))
                : query.Where(g => g.FullName.ToLower().Contains(text) || (g.Email != null && g.Email.Contains(text)));
        }

        return await query.OrderBy(g => g.FullName).ToListAsync(cancellationToken);
    }

    public async Task AddAsync(Guest guest, CancellationToken cancellationToken = default)
    {
        await _context.Guests.AddAsync(guest, cancellationToken);
    }
}
