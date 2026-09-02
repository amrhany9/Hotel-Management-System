using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HotelManagement.Infrastructure.Persistence.Seed;

public static class HotelDbSeeder
{
    public static async Task SeedAsync(HotelDbContext context, IPasswordHasherService passwordHasher, ILogger logger)
    {
        try
        {
            // 1. Seed Demo User
            if (!await context.Users.AnyAsync())
            {
                logger.LogInformation("Seeding default users...");

                var admin = new User
                {
                    FullName = "Hotel Administrator",
                    Email = "admin@hotel.local",
                    PasswordHash = passwordHasher.HashPassword("Admin123!"),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                var staff = new User
                {
                    FullName = "Front Desk Staff",
                    Email = "staff@hotel.local",
                    PasswordHash = passwordHasher.HashPassword("Staff123!"),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                context.Users.AddRange(admin, staff);
                await context.SaveChangesAsync();
            }

            // 2. Seed Rooms
            if (!await context.Rooms.AnyAsync())
            {
                logger.LogInformation("Seeding default rooms...");

                var rooms = new List<Room>
                {
                    new() { RoomNumber = "101", RoomType = "Single", PricePerNight = 80.00m, IsAvailable = true, CreatedAt = DateTime.UtcNow },
                    new() { RoomNumber = "102", RoomType = "Single", PricePerNight = 85.00m, IsAvailable = true, CreatedAt = DateTime.UtcNow },
                    new() { RoomNumber = "201", RoomType = "Double", PricePerNight = 120.00m, IsAvailable = true, CreatedAt = DateTime.UtcNow },
                    new() { RoomNumber = "202", RoomType = "Double", PricePerNight = 130.00m, IsAvailable = true, CreatedAt = DateTime.UtcNow },
                    new() { RoomNumber = "301", RoomType = "Suite", PricePerNight = 220.00m, IsAvailable = true, CreatedAt = DateTime.UtcNow },
                    new() { RoomNumber = "302", RoomType = "Suite", PricePerNight = 250.00m, IsAvailable = true, CreatedAt = DateTime.UtcNow },
                    new() { RoomNumber = "401", RoomType = "Deluxe", PricePerNight = 350.00m, IsAvailable = true, CreatedAt = DateTime.UtcNow }
                };

                context.Rooms.AddRange(rooms);
                await context.SaveChangesAsync();
            }

            // 3. Seed Reservations
            if (!await context.Reservations.AnyAsync())
            {
                logger.LogInformation("Seeding default reservations...");

                var admin = await context.Users.FirstAsync();
                var rooms = await context.Rooms.ToDictionaryAsync(r => r.RoomNumber);

                var reservations = new List<Reservation>
                {
                    // Room 101: 2 non-overlapping reservations
                    new()
                    {
                        RoomId = rooms["101"].Id,
                        GuestName = "John Smith",
                        CheckInDate = new DateOnly(2026, 8, 1),
                        CheckOutDate = new DateOnly(2026, 8, 5),
                        TotalAmount = 4 * 80.00m,
                        Status = ReservationStatus.Confirmed,
                        CreatedBy = admin.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-30)
                    },
                    new()
                    {
                        RoomId = rooms["101"].Id,
                        GuestName = "Emily Davis",
                        CheckInDate = new DateOnly(2026, 8, 10),
                        CheckOutDate = new DateOnly(2026, 8, 14),
                        TotalAmount = 4 * 80.00m,
                        Status = ReservationStatus.Confirmed,
                        CreatedBy = admin.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-20)
                    },

                    // Room 201: Double room reservations
                    new()
                    {
                        RoomId = rooms["201"].Id,
                        GuestName = "Michael Brown",
                        CheckInDate = new DateOnly(2026, 8, 3),
                        CheckOutDate = new DateOnly(2026, 8, 8),
                        TotalAmount = 5 * 120.00m,
                        Status = ReservationStatus.Confirmed,
                        CreatedBy = admin.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-25)
                    },
                    new()
                    {
                        RoomId = rooms["201"].Id,
                        GuestName = "Sarah Wilson",
                        CheckInDate = new DateOnly(2026, 8, 15),
                        CheckOutDate = new DateOnly(2026, 8, 20),
                        TotalAmount = 5 * 120.00m,
                        Status = ReservationStatus.Confirmed,
                        CreatedBy = admin.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-15)
                    },

                    // Room 301: Suite reservation
                    new()
                    {
                        RoomId = rooms["301"].Id,
                        GuestName = "Robert Taylor",
                        CheckInDate = new DateOnly(2026, 8, 5),
                        CheckOutDate = new DateOnly(2026, 8, 12),
                        TotalAmount = 7 * 220.00m,
                        Status = ReservationStatus.Confirmed,
                        CreatedBy = admin.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-28)
                    },

                    // Room 302: Cancelled reservation
                    new()
                    {
                        RoomId = rooms["302"].Id,
                        GuestName = "Jessica Martinez",
                        CheckInDate = new DateOnly(2026, 8, 7),
                        CheckOutDate = new DateOnly(2026, 8, 11),
                        TotalAmount = 4 * 250.00m,
                        Status = ReservationStatus.Cancelled,
                        CreatedBy = admin.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-18)
                    },

                    // Room 202: Recent confirmed reservation
                    new()
                    {
                        RoomId = rooms["202"].Id,
                        GuestName = "David Anderson",
                        CheckInDate = new DateOnly(2026, 9, 1),
                        CheckOutDate = new DateOnly(2026, 9, 6),
                        TotalAmount = 5 * 130.00m,
                        Status = ReservationStatus.Confirmed,
                        CreatedBy = admin.Id,
                        CreatedAt = DateTime.UtcNow.AddDays(-5)
                    }
                };

                context.Reservations.AddRange(reservations);
                await context.SaveChangesAsync();

                // Seed initial Audit Logs
                var auditLogs = new List<AuditLog>
                {
                    new()
                    {
                        Action = "Created",
                        EntityName = "System",
                        EntityId = "Init",
                        UserId = admin.Id,
                        ActionDate = DateTime.UtcNow.AddDays(-30),
                        Details = "System initialized and default database seeded."
                    }
                };
                context.AuditLogs.AddRange(auditLogs);
                await context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }
}
