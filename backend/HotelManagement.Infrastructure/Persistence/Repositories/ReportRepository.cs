using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class ReportRepository : IReportRepository
{
    private readonly HotelDbContext _context;

    public ReportRepository(HotelDbContext context)
    {
        _context = context;
    }

    public async Task<List<TopRoomReportDto>> GetTopRoomsAsync(int take, CancellationToken cancellationToken = default)
    {
        int limit = take > 0 ? take : 5;

        return await _context.Rooms
            .AsNoTracking()
            .Select(room => new
            {
                room.RoomNumber,
                room.RoomType,
                ReservationCount = room.Reservations.Count(res => res.Status != ReservationStatus.Cancelled),
                TotalRevenue = room.Reservations
                    .Where(res => res.Status != ReservationStatus.Cancelled)
                    .Sum(res => (decimal?)res.TotalAmount) ?? 0m
            })
            .OrderByDescending(x => x.ReservationCount)
            .ThenByDescending(x => x.TotalRevenue)
            .Take(limit)
            .Select(x => new TopRoomReportDto
            {
                RoomNumber = x.RoomNumber,
                RoomType = x.RoomType,
                ReservationCount = x.ReservationCount,
                TotalRevenue = x.TotalRevenue
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<RevenueReportDto> GetRevenueReportAsync(DateOnly from, DateOnly to, CancellationToken cancellationToken = default)
    {
        var reservations = await _context.Reservations
            .Include(r => r.Room)
            .AsNoTracking()
            .Where(r => r.Status != ReservationStatus.Cancelled &&
                        r.CheckInDate < to &&
                        r.CheckOutDate > from)
            .ToListAsync(cancellationToken);

        var grouped = reservations
            .GroupBy(r => r.Room.RoomType)
            .Select(g => new RoomTypeRevenueDto
            {
                RoomType = g.Key,
                ReservationCount = g.Count(),
                TotalNights = g.Sum(r =>
                {
                    var start = r.CheckInDate > from ? r.CheckInDate : from;
                    var end = r.CheckOutDate < to ? r.CheckOutDate : to;
                    return Math.Max(0, end.DayNumber - start.DayNumber);
                }),
                TotalRevenue = g.Sum(r =>
                {
                    var fullNights = Math.Max(1, r.CheckOutDate.DayNumber - r.CheckInDate.DayNumber);
                    var start = r.CheckInDate > from ? r.CheckInDate : from;
                    var end = r.CheckOutDate < to ? r.CheckOutDate : to;
                    var nightsInRange = Math.Max(0, end.DayNumber - start.DayNumber);
                    return (r.TotalAmount / fullNights) * nightsInRange;
                })
            })
            .OrderBy(x => x.RoomType)
            .ToList();

        return new RevenueReportDto
        {
            TotalReservations = reservations.Count,
            TotalNights = grouped.Sum(x => x.TotalNights),
            TotalRevenue = grouped.Sum(x => x.TotalRevenue),
            ByRoomType = grouped
        };
    }

    public async Task<List<OccupancyReportItemDto>> GetOccupancyReportAsync(DateOnly from, DateOnly to, CancellationToken cancellationToken = default)
    {
        int availableNightsInRange = to.DayNumber - from.DayNumber;

        var rooms = await _context.Rooms
            .Include(r => r.Reservations.Where(res =>
                res.Status != ReservationStatus.Cancelled &&
                res.CheckInDate < to &&
                res.CheckOutDate > from))
            .AsNoTracking()
            .OrderBy(r => r.RoomNumber)
            .ToListAsync(cancellationToken);

        return rooms.Select(room =>
        {
            int bookedNights = 0;
            foreach (var res in room.Reservations)
            {
                var start = res.CheckInDate > from ? res.CheckInDate : from;
                var end = res.CheckOutDate < to ? res.CheckOutDate : to;
                bookedNights += Math.Max(0, end.DayNumber - start.DayNumber);
            }

            bookedNights = Math.Min(bookedNights, availableNightsInRange);

            double occupancy = availableNightsInRange > 0
                ? Math.Round(((double)bookedNights / availableNightsInRange) * 100.0, 1)
                : 0.0;

            return new OccupancyReportItemDto
            {
                RoomNumber = room.RoomNumber,
                RoomType = room.RoomType,
                BookedNights = bookedNights,
                AvailableNights = availableNightsInRange,
                OccupancyPercentage = occupancy
            };
        }).ToList();
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken cancellationToken = default)
    {
        var totalRooms = await _context.Rooms.CountAsync(cancellationToken);
        var availableRooms = await _context.Rooms.CountAsync(r => r.IsAvailable, cancellationToken);
        var confirmed = await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.Confirmed, cancellationToken);
        var cancelled = await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.Cancelled, cancellationToken);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var monthStart = new DateOnly(today.Year, today.Month, 1);
        var monthEnd = monthStart.AddMonths(1);
        var daysInMonth = monthEnd.DayNumber - monthStart.DayNumber;

        double occupancyRate = 0.0;
        if (totalRooms > 0 && daysInMonth > 0)
        {
            var totalAvailableRoomNights = totalRooms * daysInMonth;
            var activeRes = await _context.Reservations
                .AsNoTracking()
                .Where(r => r.Status == ReservationStatus.Confirmed &&
                            r.CheckInDate < monthEnd &&
                            r.CheckOutDate > monthStart)
                .ToListAsync(cancellationToken);

            int bookedNights = 0;
            foreach (var r in activeRes)
            {
                var s = r.CheckInDate > monthStart ? r.CheckInDate : monthStart;
                var e = r.CheckOutDate < monthEnd ? r.CheckOutDate : monthEnd;
                bookedNights += Math.Max(0, e.DayNumber - s.DayNumber);
            }

            occupancyRate = Math.Round(((double)bookedNights / totalAvailableRoomNights) * 100.0, 1);
        }

        return new DashboardStatsDto
        {
            TotalRooms = totalRooms,
            AvailableRooms = availableRooms,
            ConfirmedReservations = confirmed,
            CancelledReservations = cancelled,
            OccupancyPercentage = occupancyRate
        };
    }
}
