using HotelManagement.Application.Commands.Reservations;
using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Domain.Enums;
using HotelManagement.Infrastructure.Persistence.Repositories;
using HotelManagement.Tests.Common;
using Microsoft.EntityFrameworkCore;

namespace HotelManagement.Tests.Reservations;

public class ReservationOverlapTests
{
    private static readonly DateOnly Today = new(2026, 9, 1);

    private static CreateReservationCommandHandler Handler(TestHotel hotel) => new(
        new RoomRepository(hotel.Context),
        new ReservationRepository(hotel.Context),
        new GuestRepository(hotel.Context),
        new UserRepository(hotel.Context),
        new AuditLogRepository(hotel.Context),
        new UnitOfWork(hotel.Context),
        hotel.CurrentUser.Object,
        hotel.SignalR.Object,
        hotel.Clock);

    private static CreateReservationCommand Command(DateOnly checkIn, DateOnly checkOut, string phone = "+20 111 222 3333", string name = "New Guest") =>
        new(1, name, phone, null, null, checkIn, checkOut, null);

    [Fact]
    public async Task CreateReservation_WhenDatesOverlapExistingConfirmed_ThrowsConflictException()
    {
        var hotel = new TestHotel(Today);
        hotel.AddReservation(new DateOnly(2026, 9, 1), 4, ReservationStatus.Confirmed);

        await Assert.ThrowsAsync<ConflictException>(() =>
            Handler(hotel).Handle(Command(new DateOnly(2026, 9, 4), new DateOnly(2026, 9, 10)), CancellationToken.None));
    }

    [Fact]
    public async Task CreateReservation_WhenDatesOverlapGuestInHouse_ThrowsConflictException()
    {
        var hotel = new TestHotel(Today);
        hotel.AddReservation(new DateOnly(2026, 8, 30), 5, ReservationStatus.CheckedIn);

        await Assert.ThrowsAsync<ConflictException>(() =>
            Handler(hotel).Handle(Command(new DateOnly(2026, 9, 2), new DateOnly(2026, 9, 6)), CancellationToken.None));
    }

    [Fact]
    public async Task CreateReservation_WhenDatesAreAdjacent_SucceedsAndCalculatesTotal()
    {
        var hotel = new TestHotel(Today);
        hotel.AddReservation(new DateOnly(2026, 9, 1), 4, ReservationStatus.Confirmed);

        var result = await Handler(hotel).Handle(Command(new DateOnly(2026, 9, 5), new DateOnly(2026, 9, 10)), CancellationToken.None);

        Assert.Equal(5, result.Nights);
        Assert.Equal(100m, result.NightlyRate);
        Assert.Equal(500m, result.TotalAmount);
        Assert.Equal(500m, result.Balance);
        Assert.Equal("Confirmed", result.Status);
    }

    [Theory]
    [InlineData(ReservationStatus.Cancelled)]
    [InlineData(ReservationStatus.NoShow)]
    [InlineData(ReservationStatus.CheckedOut)]
    public async Task CreateReservation_WhenExistingReservationNoLongerHoldsTheRoom_DoesNotBlock(ReservationStatus status)
    {
        var hotel = new TestHotel(Today);
        hotel.AddReservation(new DateOnly(2026, 9, 1), 4, status);

        var result = await Handler(hotel).Handle(Command(new DateOnly(2026, 9, 1), new DateOnly(2026, 9, 5)), CancellationToken.None);

        Assert.Equal(4, result.Nights);
        Assert.Equal(400m, result.TotalAmount);
    }

    [Fact]
    public async Task CreateReservation_WhenCheckOutBeforeOrEqualToCheckIn_ThrowsValidationException()
    {
        var hotel = new TestHotel(Today);

        await Assert.ThrowsAsync<ValidationException>(() =>
            Handler(hotel).Handle(Command(new DateOnly(2026, 9, 5), new DateOnly(2026, 9, 5)), CancellationToken.None));
    }

    [Fact]
    public async Task CreateReservation_WhenCheckInIsInThePast_ThrowsValidationException()
    {
        var hotel = new TestHotel(Today);

        await Assert.ThrowsAsync<ValidationException>(() =>
            Handler(hotel).Handle(Command(new DateOnly(2026, 8, 30), new DateOnly(2026, 9, 3)), CancellationToken.None));
    }

    [Fact]
    public async Task CreateReservation_WhenRoomIsOutOfService_ThrowsConflictException()
    {
        var hotel = new TestHotel(Today);
        hotel.Room.IsAvailable = false;
        await hotel.Context.SaveChangesAsync();

        await Assert.ThrowsAsync<ConflictException>(() =>
            Handler(hotel).Handle(Command(new DateOnly(2026, 9, 2), new DateOnly(2026, 9, 4)), CancellationToken.None));
    }

    [Fact]
    public async Task CreateReservation_WhenPhoneMatchesExistingGuest_ReusesGuestProfile()
    {
        var hotel = new TestHotel(Today);

        var result = await Handler(hotel).Handle(
            Command(new DateOnly(2026, 9, 2), new DateOnly(2026, 9, 4), phone: "+20 100 123 4567", name: "Existing Guest Updated"),
            CancellationToken.None);

        Assert.Equal(hotel.Guest.Id, result.GuestId);
        Assert.Equal(1, await hotel.Context.Guests.CountAsync());
        Assert.Equal("Existing Guest Updated", (await hotel.Context.Guests.SingleAsync()).FullName);
    }

    [Fact]
    public async Task CreateReservation_WhenPhoneIsNew_CreatesGuestProfile()
    {
        var hotel = new TestHotel(Today);

        var result = await Handler(hotel).Handle(Command(new DateOnly(2026, 9, 2), new DateOnly(2026, 9, 4)), CancellationToken.None);

        Assert.NotEqual(hotel.Guest.Id, result.GuestId);
        Assert.Equal("+201112223333", result.GuestPhone);
        Assert.Equal(2, await hotel.Context.Guests.CountAsync());
    }
}
