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

public class ReservationCancellationTests
{
    private readonly Mock<ICurrentUserService> _mockCurrentUser;
    private readonly Mock<ISignalRNotificationService> _mockSignalR;

    public ReservationCancellationTests()
    {
        _mockCurrentUser = new Mock<ICurrentUserService>();
        _mockCurrentUser.Setup(u => u.UserId).Returns(1);
        _mockCurrentUser.Setup(u => u.IsAuthenticated).Returns(true);

        _mockSignalR = new Mock<ISignalRNotificationService>();
    }

    [Fact]
    public async Task CancelReservation_WhenConfirmed_SucceedsAndSetsStatusCancelled()
    {
        // Arrange
        var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        var user = new User { Id = 1, FullName = "Admin User", Email = "admin@hotel.local", PasswordHash = "hash" };
        var room = new Room { Id = 1, RoomNumber = "101", RoomType = "Single", PricePerNight = 100m, IsAvailable = true };
        var reservation = new Reservation
        {
            Id = 1,
            RoomId = 1,
            GuestName = "Guest",
            CheckInDate = new DateOnly(2026, 9, 1),
            CheckOutDate = new DateOnly(2026, 9, 5),
            TotalAmount = 400m,
            Status = ReservationStatus.Confirmed,
            CreatedBy = 1
        };

        context.Users.Add(user);
        context.Rooms.Add(room);
        context.Reservations.Add(reservation);
        await context.SaveChangesAsync();

        var handler = new CancelReservationCommandHandler(
            new ReservationRepository(context),
            new AuditLogRepository(context),
            new UnitOfWork(context),
            _mockCurrentUser.Object,
            _mockSignalR.Object);

        // Act
        var result = await handler.Handle(new CancelReservationCommand(1), CancellationToken.None);

        // Assert
        Assert.Equal("Cancelled", result.Status);
        _mockSignalR.Verify(s => s.NotifyReservationCancelled(1), Times.Once);
    }

    [Fact]
    public async Task CancelReservation_WhenAlreadyCancelled_ThrowsConflictException()
    {
        // Arrange
        var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        var user = new User { Id = 1, FullName = "Admin User", Email = "admin@hotel.local", PasswordHash = "hash" };
        var room = new Room { Id = 1, RoomNumber = "101", RoomType = "Single", PricePerNight = 100m, IsAvailable = true };
        var reservation = new Reservation
        {
            Id = 1,
            RoomId = 1,
            GuestName = "Guest",
            CheckInDate = new DateOnly(2026, 9, 1),
            CheckOutDate = new DateOnly(2026, 9, 5),
            TotalAmount = 400m,
            Status = ReservationStatus.Cancelled,
            CreatedBy = 1
        };

        context.Users.Add(user);
        context.Rooms.Add(room);
        context.Reservations.Add(reservation);
        await context.SaveChangesAsync();

        var handler = new CancelReservationCommandHandler(
            new ReservationRepository(context),
            new AuditLogRepository(context),
            new UnitOfWork(context),
            _mockCurrentUser.Object,
            _mockSignalR.Object);

        // Act & Assert
        await Assert.ThrowsAsync<ConflictException>(() =>
            handler.Handle(new CancelReservationCommand(1), CancellationToken.None));
    }
}
