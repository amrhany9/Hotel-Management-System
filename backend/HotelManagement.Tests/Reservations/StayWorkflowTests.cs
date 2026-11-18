using HotelManagement.Application.Commands.Reservations;
using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Domain.Enums;
using HotelManagement.Tests.Common;

namespace HotelManagement.Tests.Reservations;

public class StayWorkflowTests
{
    private static readonly DateOnly Today = new(2026, 9, 10);

    private static CheckInReservationCommandHandler CheckIn(TestHotel hotel) => new(hotel.Reservations, hotel.Recorder, hotel.Clock);
    private static CheckOutReservationCommandHandler CheckOut(TestHotel hotel) => new(hotel.Reservations, hotel.Recorder, hotel.Clock);
    private static MarkNoShowCommandHandler NoShow(TestHotel hotel) => new(hotel.Reservations, hotel.Recorder, hotel.Clock);

    [Fact]
    public async Task CheckIn_OnArrivalDay_SetsStatusAndTime()
    {
        var hotel = new TestHotel(Today);
        var reservation = hotel.AddReservation(Today, 3, ReservationStatus.Confirmed);

        var result = await CheckIn(hotel).Handle(new CheckInReservationCommand(reservation.Id), CancellationToken.None);

        Assert.Equal("CheckedIn", result.Status);
        Assert.Equal(hotel.Clock.UtcNow, result.CheckedInAt);
    }

    [Fact]
    public async Task CheckIn_BeforeArrivalDay_ThrowsConflictException()
    {
        var hotel = new TestHotel(Today);
        var reservation = hotel.AddReservation(Today.AddDays(2), 3, ReservationStatus.Confirmed);

        await Assert.ThrowsAsync<ConflictException>(() =>
            CheckIn(hotel).Handle(new CheckInReservationCommand(reservation.Id), CancellationToken.None));
    }

    [Fact]
    public async Task CheckIn_AfterStayEnded_ThrowsConflictException()
    {
        var hotel = new TestHotel(Today);
        var reservation = hotel.AddReservation(Today.AddDays(-5), 3, ReservationStatus.Confirmed);

        await Assert.ThrowsAsync<ConflictException>(() =>
            CheckIn(hotel).Handle(new CheckInReservationCommand(reservation.Id), CancellationToken.None));
    }

    [Fact]
    public async Task CheckIn_WhenCancelled_ThrowsConflictException()
    {
        var hotel = new TestHotel(Today);
        var reservation = hotel.AddReservation(Today, 3, ReservationStatus.Cancelled);

        await Assert.ThrowsAsync<ConflictException>(() =>
            CheckIn(hotel).Handle(new CheckInReservationCommand(reservation.Id), CancellationToken.None));
    }

    [Fact]
    public async Task CheckOut_WithOutstandingBalance_ThrowsConflictException()
    {
        var hotel = new TestHotel(Today);
        var reservation = hotel.AddReservation(Today.AddDays(-2), 2, ReservationStatus.CheckedIn, paid: 50m);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            CheckOut(hotel).Handle(new CheckOutReservationCommand(reservation.Id), CancellationToken.None));

        Assert.Contains("150.00", ex.Message);
    }

    [Fact]
    public async Task CheckOut_WhenPaidInFull_SetsStatusAndTime()
    {
        var hotel = new TestHotel(Today);
        var reservation = hotel.AddReservation(Today.AddDays(-2), 2, ReservationStatus.CheckedIn, paid: 200m);

        var result = await CheckOut(hotel).Handle(new CheckOutReservationCommand(reservation.Id), CancellationToken.None);

        Assert.Equal("CheckedOut", result.Status);
        Assert.Equal(0m, result.Balance);
        Assert.NotNull(result.CheckedOutAt);
    }

    [Fact]
    public async Task CheckOut_WhenNotCheckedIn_ThrowsConflictException()
    {
        var hotel = new TestHotel(Today);
        var reservation = hotel.AddReservation(Today, 2, ReservationStatus.Confirmed, paid: 200m);

        await Assert.ThrowsAsync<ConflictException>(() =>
            CheckOut(hotel).Handle(new CheckOutReservationCommand(reservation.Id), CancellationToken.None));
    }

    [Fact]
    public async Task NoShow_OnOrAfterArrivalDay_SetsStatus()
    {
        var hotel = new TestHotel(Today);
        var reservation = hotel.AddReservation(Today.AddDays(-1), 3, ReservationStatus.Confirmed);

        var result = await NoShow(hotel).Handle(new MarkNoShowCommand(reservation.Id), CancellationToken.None);

        Assert.Equal("NoShow", result.Status);
    }

    [Fact]
    public async Task NoShow_BeforeArrivalDay_ThrowsConflictException()
    {
        var hotel = new TestHotel(Today);
        var reservation = hotel.AddReservation(Today.AddDays(1), 3, ReservationStatus.Confirmed);

        await Assert.ThrowsAsync<ConflictException>(() =>
            NoShow(hotel).Handle(new MarkNoShowCommand(reservation.Id), CancellationToken.None));
    }
}
