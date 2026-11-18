using HotelManagement.Application.Commands.Rooms;
using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Domain.Enums;
using HotelManagement.Infrastructure.Persistence.Repositories;
using HotelManagement.Tests.Common;
using Moq;

namespace HotelManagement.Tests.Rooms;

public class RoomDeletionTests
{
    private static readonly DateOnly Today = DateOnly.FromDateTime(DateTime.UtcNow);

    private static DeleteRoomCommandHandler Handler(TestHotel hotel) => new(
        new RoomRepository(hotel.Context),
        new ReservationRepository(hotel.Context),
        new AuditLogRepository(hotel.Context),
        new UnitOfWork(hotel.Context),
        hotel.CurrentUser.Object,
        hotel.SignalR.Object);

    [Fact]
    public async Task DeleteRoom_WhenHasFutureConfirmedReservation_ThrowsConflictException()
    {
        var hotel = new TestHotel(Today);
        hotel.AddReservation(Today.AddDays(10), 3, ReservationStatus.Confirmed);

        await Assert.ThrowsAsync<ConflictException>(() => Handler(hotel).Handle(new DeleteRoomCommand(1), CancellationToken.None));
    }

    [Fact]
    public async Task DeleteRoom_WhenGuestIsInHouse_ThrowsConflictException()
    {
        var hotel = new TestHotel(Today);
        hotel.AddReservation(Today.AddDays(-1), 3, ReservationStatus.CheckedIn);

        await Assert.ThrowsAsync<ConflictException>(() => Handler(hotel).Handle(new DeleteRoomCommand(1), CancellationToken.None));
    }

    [Fact]
    public async Task DeleteRoom_WhenOnlyHasPastOrCancelledReservations_Succeeds()
    {
        var hotel = new TestHotel(Today);
        hotel.AddReservation(new DateOnly(2020, 1, 1), 4, ReservationStatus.CheckedOut, paid: 400m);
        hotel.AddReservation(Today.AddDays(10), 5, ReservationStatus.Cancelled);

        await Handler(hotel).Handle(new DeleteRoomCommand(1), CancellationToken.None);

        Assert.Null(await hotel.Context.Rooms.FindAsync(1));
        hotel.SignalR.Verify(s => s.NotifyRoomDeleted(1), Times.Once);
    }
}
