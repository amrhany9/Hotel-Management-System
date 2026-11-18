using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Infrastructure.Persistence.Repositories;

public class ReportRepository : IReportRepository
{
    private readonly HotelDbContext _context;
    private readonly IClock _clock;

    public ReportRepository(HotelDbContext context, IClock clock)
    {
        _context = context;
        _clock = clock;
    }

    private IQueryable<Reservation> Stays => _context.Reservations.Where(r =>
        r.Status == ReservationStatus.Confirmed ||
        r.Status == ReservationStatus.CheckedIn ||
        r.Status == ReservationStatus.CheckedOut);

    public async Task<List<TopRoomReportDto>> GetTopRoomsAsync(int take, CancellationToken cancellationToken = default)
    {
        int limit = take > 0 ? take : 5;

        return await _context.Rooms
            .AsNoTracking()
            .Select(room => new
            {
                room.RoomNumber,
                room.RoomType,
                ReservationCount = room.Reservations.Count(res =>
                    res.Status == ReservationStatus.Confirmed ||
                    res.Status == ReservationStatus.CheckedIn ||
                    res.Status == ReservationStatus.CheckedOut),
                TotalRevenue = room.Reservations
                    .Where(res =>
                        res.Status == ReservationStatus.Confirmed ||
                        res.Status == ReservationStatus.CheckedIn ||
                        res.Status == ReservationStatus.CheckedOut)
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
        var reservations = await Stays
            .Include(r => r.Room)
            .AsNoTracking()
            .Where(r => r.CheckInDate < to && r.CheckOutDate > from)
            .ToListAsync(cancellationToken);

        var grouped = reservations
            .GroupBy(r => r.Room.RoomType)
            .Select(g => new RoomTypeRevenueDto
            {
                RoomType = g.Key,
                ReservationCount = g.Count(),
                TotalNights = g.Sum(r => NightsInRange(r, from, to)),
                TotalRevenue = g.Sum(r => r.NightlyRate * NightsInRange(r, from, to))
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
                (res.Status == ReservationStatus.Confirmed ||
                 res.Status == ReservationStatus.CheckedIn ||
                 res.Status == ReservationStatus.CheckedOut) &&
                res.CheckInDate < to &&
                res.CheckOutDate > from))
            .AsNoTracking()
            .OrderBy(r => r.RoomNumber)
            .ToListAsync(cancellationToken);

        return rooms.Select(room =>
        {
            int bookedNights = Math.Min(room.Reservations.Sum(res => NightsInRange(res, from, to)), availableNightsInRange);

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
        var today = _clock.Today;
        var monthStart = new DateOnly(today.Year, today.Month, 1);
        var monthEnd = monthStart.AddMonths(1);
        var daysInMonth = monthEnd.DayNumber - monthStart.DayNumber;
        var monthStartUtc = monthStart.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var monthEndUtc = monthEnd.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        var totalRooms = await _context.Rooms.CountAsync(cancellationToken);
        var availableRooms = await _context.Rooms.CountAsync(r => r.IsAvailable, cancellationToken);
        var confirmed = await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.Confirmed, cancellationToken);
        var cancelled = await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.Cancelled, cancellationToken);
        var arrivals = await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.Confirmed && r.CheckInDate == today, cancellationToken);
        var departures = await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.CheckedIn && r.CheckOutDate <= today, cancellationToken);
        var inHouse = await _context.Reservations.CountAsync(r => r.Status == ReservationStatus.CheckedIn, cancellationToken);

        var inHouseTotals = await _context.Reservations
            .Where(r => r.Status == ReservationStatus.CheckedIn)
            .Select(r => new { r.TotalAmount, Paid = r.Payments.Sum(p => (decimal?)p.Amount) ?? 0m })
            .ToListAsync(cancellationToken);

        var paymentsThisMonth = await _context.Payments
            .Where(p => p.PaidAt >= monthStartUtc && p.PaidAt < monthEndUtc)
            .SumAsync(p => (decimal?)p.Amount, cancellationToken) ?? 0m;

        double occupancyRate = 0.0;
        if (totalRooms > 0 && daysInMonth > 0)
        {
            var activeRes = await Stays
                .AsNoTracking()
                .Where(r => r.CheckInDate < monthEnd && r.CheckOutDate > monthStart)
                .ToListAsync(cancellationToken);

            int bookedNights = activeRes.Sum(r => NightsInRange(r, monthStart, monthEnd));
            occupancyRate = Math.Round(((double)bookedNights / (totalRooms * daysInMonth)) * 100.0, 1);
        }

        return new DashboardStatsDto
        {
            TotalRooms = totalRooms,
            AvailableRooms = availableRooms,
            ConfirmedReservations = confirmed,
            CancelledReservations = cancelled,
            OccupancyPercentage = occupancyRate,
            ArrivalsToday = arrivals,
            DeparturesToday = departures,
            InHouse = inHouse,
            OutstandingBalance = inHouseTotals.Sum(x => x.TotalAmount - x.Paid),
            PaymentsThisMonth = paymentsThisMonth
        };
    }

    private static int NightsInRange(Reservation r, DateOnly from, DateOnly to)
    {
        var start = r.CheckInDate > from ? r.CheckInDate : from;
        var end = r.CheckOutDate < to ? r.CheckOutDate : to;
        return Math.Max(0, end.DayNumber - start.DayNumber);
    }
}
