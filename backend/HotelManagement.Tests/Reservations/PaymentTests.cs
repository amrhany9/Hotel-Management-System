using HotelManagement.Application.Commands.Reservations;
using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Validators.Reservations;
using HotelManagement.Domain.Enums;
using HotelManagement.Infrastructure.Persistence.Repositories;
using HotelManagement.Tests.Common;

namespace HotelManagement.Tests.Reservations;

public class PaymentTests
{
    private static readonly DateOnly Today = new(2026, 9, 10);

    private static RecordPaymentCommandHandler Handler(TestHotel hotel) =>
        new(hotel.Reservations, new UserRepository(hotel.Context), hotel.Recorder, hotel.Clock);

    [Fact]
    public async Task RecordPayment_ReducesBalanceAndKeepsHistory()
    {
        var hotel = new TestHotel(Today);
        var reservation = hotel.AddReservation(Today, 3, ReservationStatus.Confirmed, paid: 100m);

        var result = await Handler(hotel).Handle(
            new RecordPaymentCommand(reservation.Id, 150m, PaymentMethod.Card, "POS-123"),
            CancellationToken.None);

        Assert.Equal(250m, result.AmountPaid);
        Assert.Equal(50m, result.Balance);
        Assert.Equal(2, result.Payments.Count);
        Assert.Equal("Card", result.Payments[^1].Method);
        Assert.Equal("POS-123", result.Payments[^1].Reference);
        Assert.Equal("Admin User", result.Payments[^1].ReceivedByName);
    }

    [Fact]
    public async Task RecordPayment_MoreThanBalance_ThrowsConflictException()
    {
        var hotel = new TestHotel(Today);
        var reservation = hotel.AddReservation(Today, 2, ReservationStatus.CheckedIn, paid: 150m);

        await Assert.ThrowsAsync<ConflictException>(() =>
            Handler(hotel).Handle(new RecordPaymentCommand(reservation.Id, 60m, PaymentMethod.Cash, null), CancellationToken.None));
    }

    [Theory]
    [InlineData(ReservationStatus.Cancelled)]
    [InlineData(ReservationStatus.NoShow)]
    public async Task RecordPayment_OnClosedReservation_ThrowsConflictException(ReservationStatus status)
    {
        var hotel = new TestHotel(Today);
        var reservation = hotel.AddReservation(Today, 2, status);

        await Assert.ThrowsAsync<ConflictException>(() =>
            Handler(hotel).Handle(new RecordPaymentCommand(reservation.Id, 50m, PaymentMethod.Cash, null), CancellationToken.None));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-10)]
    [InlineData(10.555)]
    public void Validator_RejectsInvalidAmounts(decimal amount)
    {
        var result = new RecordPaymentCommandValidator().Validate(new RecordPaymentCommand(1, amount, PaymentMethod.Cash, null));

        Assert.False(result.IsValid);
    }
}
