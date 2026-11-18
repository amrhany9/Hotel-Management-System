using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HotelManagement.Infrastructure.Persistence.Seed;

public static class HotelDbSeeder
{
    private enum Paid { None, Deposit, Full }

    private sealed record Stay(string Room, int Guest, int StartOffset, int Nights, ReservationStatus Status, Paid Paid, string? Notes = null);

    private static readonly (string Number, string Type, decimal Price, bool InService)[] RoomPlan =
    [
        ("101", "Standard", 85m, true),
        ("102", "Standard", 85m, true),
        ("103", "Standard", 90m, true),
        ("104", "Standard", 90m, false),
        ("201", "Deluxe", 130m, true),
        ("202", "Deluxe", 130m, true),
        ("203", "Deluxe", 140m, true),
        ("204", "Deluxe", 140m, true),
        ("301", "Junior Suite", 210m, true),
        ("302", "Junior Suite", 220m, true),
        ("401", "Family Suite", 260m, true),
        ("402", "Presidential Suite", 450m, true)
    ];

    private static readonly (string Name, string Phone, string? Email, string? IdNumber)[] GuestPlan =
    [
        ("Omar Khaled", "+201001234567", "omar.khaled@example.com", "29001011234567"),
        ("Sarah Mitchell", "+447700900123", "sarah.mitchell@example.com", "GB5531207"),
        ("Laila Hassan", "+201112345678", "laila.hassan@example.com", "29505151234561"),
        ("Fahad Al-Qahtani", "+966501234567", "fahad.q@example.com", "SA1049327"),
        ("Daniel Weber", "+4915112345678", "daniel.weber@example.com", "DE8812034"),
        ("Mariam Youssef", "+201223456789", null, "29811231234569"),
        ("James Carter", "+12025550143", "james.carter@example.com", "US6620154"),
        ("Aisha Al-Mansouri", "+971501234567", "aisha.m@example.com", "AE7730118"),
        ("Youssef Mahmoud", "+201098765432", "youssef.m@example.com", null),
        ("Elena Rossi", "+393471234567", "elena.rossi@example.com", "IT4419021"),
        ("Khaled Al-Harbi", "+966551234567", null, "SA2208815"),
        ("Nadia Farouk", "+201156789012", "nadia.farouk@example.com", null),
        ("Lucas Martin", "+33612345678", "lucas.martin@example.com", "FR3301766"),
        ("Hana Ibrahim", "+201287654321", "hana.ibrahim@example.com", "29207071234565"),
        ("Tariq Rahman", "+971551234567", "tariq.rahman@example.com", "AE1150442"),
        ("Sofia Petrova", "+359881234567", "sofia.petrova@example.com", "BG9024417")
    ];

    private static readonly Stay[] StayPlan =
    [
        new("101", 0, -40, 4, ReservationStatus.CheckedOut, Paid.Full),
        new("201", 1, -35, 5, ReservationStatus.CheckedOut, Paid.Full),
        new("301", 2, -28, 7, ReservationStatus.CheckedOut, Paid.Full, "Anniversary trip, flowers in the room"),
        new("102", 3, -25, 3, ReservationStatus.CheckedOut, Paid.Full),
        new("202", 4, -20, 5, ReservationStatus.CheckedOut, Paid.Full),
        new("204", 11, -16, 3, ReservationStatus.Cancelled, Paid.None),
        new("401", 5, -18, 6, ReservationStatus.CheckedOut, Paid.Full, "Two children, extra bed"),
        new("103", 6, -14, 4, ReservationStatus.CheckedOut, Paid.Full),
        new("203", 7, -12, 3, ReservationStatus.CheckedOut, Paid.Full),
        new("302", 8, -10, 4, ReservationStatus.CheckedOut, Paid.Full),
        new("101", 9, -8, 4, ReservationStatus.CheckedOut, Paid.Full),
        new("402", 10, -7, 3, ReservationStatus.CheckedOut, Paid.Full, "Airport pickup requested"),
        new("102", 13, -3, 2, ReservationStatus.NoShow, Paid.None),
        new("201", 14, -3, 5, ReservationStatus.CheckedIn, Paid.Deposit),
        new("301", 15, -2, 5, ReservationStatus.CheckedIn, Paid.Full),
        new("202", 0, -1, 5, ReservationStatus.CheckedIn, Paid.Deposit, "Returning guest, high floor preferred"),
        new("401", 2, -4, 4, ReservationStatus.CheckedIn, Paid.Deposit),
        new("203", 5, -2, 2, ReservationStatus.CheckedIn, Paid.Full),
        new("101", 3, 0, 3, ReservationStatus.Confirmed, Paid.Deposit, "Late arrival around 11 pm"),
        new("302", 6, 0, 2, ReservationStatus.Confirmed, Paid.None),
        new("204", 7, 0, 5, ReservationStatus.Confirmed, Paid.Deposit),
        new("102", 8, 2, 3, ReservationStatus.Confirmed, Paid.None),
        new("103", 9, 3, 4, ReservationStatus.Confirmed, Paid.Deposit),
        new("201", 10, 5, 4, ReservationStatus.Confirmed, Paid.None),
        new("402", 11, 6, 3, ReservationStatus.Confirmed, Paid.Deposit, "Business trip, needs meeting room"),
        new("302", 12, 8, 3, ReservationStatus.Cancelled, Paid.None),
        new("301", 1, 10, 4, ReservationStatus.Confirmed, Paid.None),
        new("202", 12, 12, 3, ReservationStatus.Confirmed, Paid.None),
        new("401", 13, 15, 5, ReservationStatus.Confirmed, Paid.Deposit),
        new("203", 4, 18, 3, ReservationStatus.Confirmed, Paid.None)
    ];

    public static async Task SeedAsync(HotelDbContext context, IPasswordHasherService passwordHasher, IClock clock, ILogger logger)
    {
        if (!await context.Users.AnyAsync())
        {
            logger.LogInformation("Seeding staff accounts...");
            context.Users.AddRange(
                new User { FullName = "Nour Hassan", Email = "admin@hotel.local", PasswordHash = passwordHasher.HashPassword("Admin123!"), Role = UserRole.Admin, CreatedAt = clock.UtcNow.AddDays(-90) },
                new User { FullName = "Karim Fawzy", Email = "staff@hotel.local", PasswordHash = passwordHasher.HashPassword("Staff123!"), Role = UserRole.FrontDesk, CreatedAt = clock.UtcNow.AddDays(-80) },
                new User { FullName = "Salma Adel", Email = "salma@hotel.local", PasswordHash = passwordHasher.HashPassword(Guid.NewGuid().ToString("N")), Role = UserRole.FrontDesk, CreatedAt = clock.UtcNow.AddDays(-60) },
                new User { FullName = "Mostafa Nabil", Email = "mostafa@hotel.local", PasswordHash = passwordHasher.HashPassword(Guid.NewGuid().ToString("N")), Role = UserRole.FrontDesk, IsActive = false, CreatedAt = clock.UtcNow.AddDays(-120) });
            await context.SaveChangesAsync();
        }

        if (!await context.Rooms.AnyAsync())
        {
            logger.LogInformation("Seeding rooms...");
            context.Rooms.AddRange(RoomPlan.Select(r => new Room
            {
                RoomNumber = r.Number,
                RoomType = r.Type,
                PricePerNight = r.Price,
                IsAvailable = r.InService,
                CreatedAt = clock.UtcNow.AddDays(-90)
            }));
            await context.SaveChangesAsync();
        }

        if (!await context.Reservations.AnyAsync())
        {
            logger.LogInformation("Seeding guests, reservations and payments...");
            await SeedStaysAsync(context, clock);
        }
    }

    public static async Task ResetAsync(HotelDbContext context, IPasswordHasherService passwordHasher, IClock clock, ILogger logger)
    {
        logger.LogInformation("Resetting demo data...");
        await context.Payments.ExecuteDeleteAsync();
        await context.AuditLogs.ExecuteDeleteAsync();
        await context.Reservations.ExecuteDeleteAsync();
        await context.Guests.ExecuteDeleteAsync();
        await context.Rooms.ExecuteDeleteAsync();
        await context.Users.ExecuteDeleteAsync();
        context.ChangeTracker.Clear();
        await SeedAsync(context, passwordHasher, clock, logger);
    }

    private static async Task SeedStaysAsync(HotelDbContext context, IClock clock)
    {
        var today = clock.Today;
        var admin = await context.Users.FirstAsync(u => u.Role == UserRole.Admin);
        var staff = await context.Users.Where(u => u.Role == UserRole.FrontDesk && u.IsActive).OrderBy(u => u.Id).FirstOrDefaultAsync() ?? admin;
        var rooms = await context.Rooms.ToDictionaryAsync(r => r.RoomNumber);

        var guests = GuestPlan.Select((g, i) => new Guest
        {
            FullName = g.Name,
            Phone = PhoneNumber.Normalize(g.Phone),
            Email = g.Email,
            IdNumber = g.IdNumber,
            CreatedAt = At(today.AddDays(-60 + i), 9)
        }).ToList();
        context.Guests.AddRange(guests);
        await context.SaveChangesAsync();

        var logs = new List<AuditLog>
        {
            new() { Action = "Created", EntityName = "System", EntityId = "Init", UserId = admin.Id, ActionDate = At(today.AddDays(-90), 8), Details = "System initialized and demo data loaded." }
        };

        foreach (var (stay, index) in StayPlan.Select((s, i) => (s, i)))
        {
            var room = rooms[stay.Room];
            var guest = guests[stay.Guest];
            var checkIn = today.AddDays(stay.StartOffset);
            var checkOut = checkIn.AddDays(stay.Nights);
            var bookedBy = index % 3 == 0 ? admin : staff;
            var total = room.PricePerNight * stay.Nights;
            var createdAt = At(checkIn.AddDays(-12 - index % 9), 10 + index % 7);
            if (createdAt > clock.UtcNow)
            {
                createdAt = clock.UtcNow.AddHours(-(index + 2));
            }

            var reservation = new Reservation
            {
                RoomId = room.Id,
                GuestId = guest.Id,
                CheckInDate = checkIn,
                CheckOutDate = checkOut,
                NightlyRate = room.PricePerNight,
                TotalAmount = total,
                Status = stay.Status,
                Notes = stay.Notes,
                CreatedBy = bookedBy.Id,
                CreatedAt = createdAt,
                CheckedInAt = stay.Status is ReservationStatus.CheckedIn or ReservationStatus.CheckedOut ? At(checkIn, 14) : null,
                CheckedOutAt = stay.Status == ReservationStatus.CheckedOut ? At(checkOut, 11) : null
            };

            var deposit = Math.Round(total * 0.3m, 0);
            if (stay.Paid != Paid.None)
            {
                reservation.Payments.Add(new Payment
                {
                    Amount = stay.Paid == Paid.Full && stay.Status != ReservationStatus.CheckedOut ? total : deposit,
                    Method = index % 2 == 0 ? PaymentMethod.Card : PaymentMethod.BankTransfer,
                    Reference = index % 2 == 0 ? $"POS-{48210 + index}" : $"TRX-{730150 + index * 7}",
                    PaidAt = createdAt.AddMinutes(20),
                    ReceivedBy = bookedBy.Id
                });
            }

            if (stay.Paid == Paid.Full && stay.Status == ReservationStatus.CheckedOut)
            {
                reservation.Payments.Add(new Payment
                {
                    Amount = total - deposit,
                    Method = index % 3 == 0 ? PaymentMethod.Cash : PaymentMethod.Card,
                    Reference = index % 3 == 0 ? null : $"POS-{51300 + index}",
                    PaidAt = At(checkOut, 10),
                    ReceivedBy = staff.Id
                });
            }

            context.Reservations.Add(reservation);
            await context.SaveChangesAsync();

            logs.Add(Log("Created", reservation, bookedBy, createdAt, $"Created reservation for guest '{guest.FullName}' in room {room.RoomNumber} ({checkIn:yyyy-MM-dd} to {checkOut:yyyy-MM-dd}, {stay.Nights} nights, {Money.Format(total)})"));
            foreach (var payment in reservation.Payments)
            {
                logs.Add(Log("Payment", reservation, payment.ReceivedBy == admin.Id ? admin : staff, payment.PaidAt, $"Recorded {payment.Method} payment of {Money.Format(payment.Amount)} for reservation #{reservation.Id} ('{guest.FullName}')"));
            }
            if (reservation.CheckedInAt is { } inAt)
            {
                logs.Add(Log("Checked in", reservation, staff, inAt, $"Checked in guest '{guest.FullName}' to room {room.RoomNumber} (reservation #{reservation.Id})"));
            }
            if (reservation.CheckedOutAt is { } outAt)
            {
                logs.Add(Log("Checked out", reservation, staff, outAt, $"Checked out guest '{guest.FullName}' from room {room.RoomNumber} (reservation #{reservation.Id})"));
            }
            if (stay.Status == ReservationStatus.Cancelled)
            {
                logs.Add(Log("Cancelled", reservation, staff, createdAt.AddDays(2), $"Cancelled reservation #{reservation.Id} for guest '{guest.FullName}' (Room {room.RoomNumber})"));
            }
            if (stay.Status == ReservationStatus.NoShow)
            {
                logs.Add(Log("No-show", reservation, staff, At(checkIn.AddDays(1), 9), $"Marked reservation #{reservation.Id} for guest '{guest.FullName}' as a no-show (Room {room.RoomNumber})"));
            }
        }

        context.AuditLogs.AddRange(logs.Where(l => l.ActionDate <= clock.UtcNow));
        await context.SaveChangesAsync();
    }

    private static AuditLog Log(string action, Reservation reservation, User user, DateTime at, string details) => new()
    {
        Action = action,
        EntityName = "Reservation",
        EntityId = reservation.Id.ToString(),
        UserId = user.Id,
        ActionDate = at,
        Details = details
    };

    private static DateTime At(DateOnly date, int hour) => date.ToDateTime(new TimeOnly(hour, 0), DateTimeKind.Utc);
}
