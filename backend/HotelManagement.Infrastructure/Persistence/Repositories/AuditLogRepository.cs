using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class AuditLogRepository : IAuditLogRepository
{
    private readonly HotelDbContext _context;

    public AuditLogRepository(HotelDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(AuditLog log, CancellationToken cancellationToken = default)
    {
        await _context.AuditLogs.AddAsync(log, cancellationToken);
    }

    public async Task<List<AuditLog>> GetRecentAsync(int take, CancellationToken cancellationToken = default)
    {
        int limit = take > 0 ? Math.Min(take, 500) : 100;

        return await _context.AuditLogs
            .Include(a => a.User)
            .AsNoTracking()
            .OrderByDescending(a => a.ActionDate)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }
}
