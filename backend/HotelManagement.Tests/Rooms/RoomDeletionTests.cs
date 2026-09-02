using HotelManagement.Application.Commands.Rooms;
using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using HotelManagement.Infrastructure.Persistence.Repositories;
using HotelManagement.Tests.Common;
using Moq;
using Xunit;

namespace HotelManagement.Tests.Rooms;

public class RoomDeletionTests
{
    private readonly Mock<ICurrentUserService> _mockCurrentUser;
    private readonly Mock<ISignalRNotificationService> _mockSignalR;

    public RoomDeletionTests()
    {
        _mockCurrentUser = new Mock<ICurrentUserService>();
        _mockCurrentUser.Setup(u => u.UserId).Returns(1);
        _mockCurrentUser.Setup(u => u.IsAuthenticated).Returns(true);

        _mockSignalR = new Mock<ISignalRNotificationService>();
    }

    [Fact]
    public async Task DeleteRoom_WhenHasFutureConfirmedReservation_ThrowsConflictException()
    {
        // Arrange
        var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        var user = new User { Id = 1, FullName = "Admin User", Email = "admin@hotel.local", PasswordHash = "hash" };
        var room = new Room { Id = 1, RoomNumber = "101", RoomType = "Single", PricePerNight = 100m, IsAvailable = true };
        var futureDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10));
        var futureConfirmed = new Reservation
        {
            Id = 1,
            RoomId = 1,
            GuestName = "Future Guest",
            CheckInDate = futureDate,
            CheckOutDate = futureDate.AddDays(3),
            TotalAmount = 300m,
            Status = ReservationStatus.Confirmed,
            CreatedBy = 1
        };

        context.Users.Add(user);
        context.Rooms.Add(room);
        context.Reservations.Add(futureConfirmed);
        await context.SaveChangesAsync();

        var handler = new DeleteRoomCommandHandler(
            new RoomRepository(context),
            new ReservationRepository(context),
            new AuditLogRepository(context),
            new UnitOfWork(context),
            _mockCurrentUser.Object,
            _mockSignalR.Object);

        // Act & Assert
        await Assert.ThrowsAsync<ConflictException>(() =>
            handler.Handle(new DeleteRoomCommand(1), CancellationToken.None));
    }

    [Fact]
    public async Task DeleteRoom_WhenOnlyHasPastOrCancelledReservations_Succeeds()
    {
        // Arrange
        var context = TestDbContextFactory.Create(Guid.NewGuid().ToString());
        var user = new User { Id = 1, FullName = "Admin User", Email = "admin@hotel.local", PasswordHash = "hash" };
        var room = new Room { Id = 1, RoomNumber = "101", RoomType = "Single", PricePerNight = 100m, IsAvailable = true };
        var pastConfirmed = new Reservation
        {
            Id = 1,
            RoomId = 1,
            GuestName = "Past Guest",
            CheckInDate = new DateOnly(2020, 1, 1),
            CheckOutDate = new DateOnly(2020, 1, 5),
            TotalAmount = 400m,
            Status = ReservationStatus.Confirmed,
            CreatedBy = 1
        };
        var futureCancelled = new Reservation
        {
            Id = 2,
            RoomId = 1,
            GuestName = "Cancelled Guest",
            CheckInDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)),
            CheckOutDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(15)),
            TotalAmount = 500m,
            Status = ReservationStatus.Cancelled,
            CreatedBy = 1
        };

        context.Users.Add(user);
        context.Rooms.Add(room);
        context.Reservations.AddRange(pastConfirmed, futureCancelled);
        await context.SaveChangesAsync();

        var handler = new DeleteRoomCommandHandler(
            new RoomRepository(context),
            new ReservationRepository(context),
            new AuditLogRepository(context),
            new UnitOfWork(context),
            _mockCurrentUser.Object,
            _mockSignalR.Object);

        // Act
        await handler.Handle(new DeleteRoomCommand(1), CancellationToken.None);

        // Assert
        var deletedRoom = await context.Rooms.FindAsync(1);
        Assert.Null(deletedRoom);
        _mockSignalR.Verify(s => s.NotifyRoomDeleted(1), Times.Once);
    }
}
