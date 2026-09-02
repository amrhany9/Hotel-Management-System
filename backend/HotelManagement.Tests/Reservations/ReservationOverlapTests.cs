using HotelManagement.Application.Commands.Reservations;
using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using HotelManagement.Infrastructure.Persistence.Repositories;
using HotelManagement.Tests.Common;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Reservations;

public class ReservationOverlapTests
{
    private readonly Mock<ICurrentUserService> _mockCurrentUser;
    private readonly Mock<ISignalRNotificationService> _mockSignalR;

    public ReservationOverlapTests()
    {
        _mockCurrentUser = new Mock<ICurrentUserService>();
        _mockCurrentUser.Setup(u => u.UserId).Returns(1);
        _mockCurrentUser.Setup(u => u.IsAuthenticated).Returns(true);

        _mockSignalR = new Mock<ISignalRNotificationService>();
    }

    [Fact]
    public async Task CreateReservation_WhenDatesOverlapExistingConfirmed_ThrowsConflictException()
    {
        // Arrange
        var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        var user = new User { Id = 1, FullName = "Admin User", Email = "admin@hotel.local", PasswordHash = "hash" };
        var room = new Room { Id = 1, RoomNumber = "101", RoomType = "Single", PricePerNight = 100m, IsAvailable = true };
        var existing = new Reservation
        {
            Id = 1,
            RoomId = 1,
            GuestName = "Existing Guest",
            CheckInDate = new DateOnly(2026, 9, 1),
            CheckOutDate = new DateOnly(2026, 9, 5),
            TotalAmount = 400m,
            Status = ReservationStatus.Confirmed,
            CreatedBy = 1
        };

        context.Users.Add(user);
        context.Rooms.Add(room);
        context.Reservations.Add(existing);
        await context.SaveChangesAsync();

        var handler = new CreateReservationCommandHandler(
            new RoomRepository(context),
            new ReservationRepository(context),
            new UserRepository(context),
            new AuditLogRepository(context),
            new UnitOfWork(context),
            _mockCurrentUser.Object,
            _mockSignalR.Object);

        var command = new CreateReservationCommand(
            RoomId: 1,
            GuestName: "New Guest",
            CheckInDate: new DateOnly(2026, 9, 4),
            CheckOutDate: new DateOnly(2026, 9, 10)
        );

        // Act & Assert
        await Assert.ThrowsAsync<ConflictException>(() => handler.Handle(command, CancellationToken.None));
    }

    [Fact]
    public async Task CreateReservation_WhenDatesAreAdjacent_SucceedsAndCalculatesTotal()
    {
        // Arrange
        var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        var user = new User { Id = 1, FullName = "Admin User", Email = "admin@hotel.local", PasswordHash = "hash" };
        var room = new Room { Id = 1, RoomNumber = "101", RoomType = "Single", PricePerNight = 100m, IsAvailable = true };
        var existing = new Reservation
        {
            Id = 1,
            RoomId = 1,
            GuestName = "Existing Guest",
            CheckInDate = new DateOnly(2026, 9, 1),
            CheckOutDate = new DateOnly(2026, 9, 5),
            TotalAmount = 400m,
            Status = ReservationStatus.Confirmed,
            CreatedBy = 1
        };

        context.Users.Add(user);
        context.Rooms.Add(room);
        context.Reservations.Add(existing);
        await context.SaveChangesAsync();

        var handler = new CreateReservationCommandHandler(
            new RoomRepository(context),
            new ReservationRepository(context),
            new UserRepository(context),
            new AuditLogRepository(context),
            new UnitOfWork(context),
            _mockCurrentUser.Object,
            _mockSignalR.Object);

        var command = new CreateReservationCommand(
            RoomId: 1,
            GuestName: "New Guest",
            CheckInDate: new DateOnly(2026, 9, 5),
            CheckOutDate: new DateOnly(2026, 9, 10)
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(5, result.Nights);
        Assert.Equal(500m, result.TotalAmount);
        Assert.Equal("Confirmed", result.Status);
    }

    [Fact]
    public async Task CreateReservation_WhenExistingReservationIsCancelled_DoesNotBlock()
    {
        // Arrange
        var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        var user = new User { Id = 1, FullName = "Admin User", Email = "admin@hotel.local", PasswordHash = "hash" };
        var room = new Room { Id = 1, RoomNumber = "101", RoomType = "Single", PricePerNight = 100m, IsAvailable = true };
        var cancelled = new Reservation
        {
            Id = 1,
            RoomId = 1,
            GuestName = "Cancelled Guest",
            CheckInDate = new DateOnly(2026, 9, 1),
            CheckOutDate = new DateOnly(2026, 9, 5),
            TotalAmount = 400m,
            Status = ReservationStatus.Cancelled,
            CreatedBy = 1
        };

        context.Users.Add(user);
        context.Rooms.Add(room);
        context.Reservations.Add(cancelled);
        await context.SaveChangesAsync();

        var handler = new CreateReservationCommandHandler(
            new RoomRepository(context),
            new ReservationRepository(context),
            new UserRepository(context),
            new AuditLogRepository(context),
            new UnitOfWork(context),
            _mockCurrentUser.Object,
            _mockSignalR.Object);

        var command = new CreateReservationCommand(
            RoomId: 1,
            GuestName: "New Guest",
            CheckInDate: new DateOnly(2026, 9, 1),
            CheckOutDate: new DateOnly(2026, 9, 5)
        );

        // Act
        var result = await handler.Handle(command, CancellationToken.None);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(4, result.Nights);
        Assert.Equal(400m, result.TotalAmount);
    }

    [Fact]
    public async Task CreateReservation_WhenCheckOutBeforeOrEqualToCheckIn_ThrowsValidationException()
    {
        // Arrange
        var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        var handler = new CreateReservationCommandHandler(
            new RoomRepository(context),
            new ReservationRepository(context),
            new UserRepository(context),
            new AuditLogRepository(context),
            new UnitOfWork(context),
            _mockCurrentUser.Object,
            _mockSignalR.Object);

        var command = new CreateReservationCommand(
            RoomId: 1,
            GuestName: "Invalid Guest",
            CheckInDate: new DateOnly(2026, 9, 5),
            CheckOutDate: new DateOnly(2026, 9, 5)
        );

        // Act & Assert
        await Assert.ThrowsAsync<ValidationException>(() => handler.Handle(command, CancellationToken.None));
    }
}
