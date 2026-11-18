using HotelManagement.Application.Commands.Reservations;
using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Enums;
using HotelManagement.Tests.Common;
using Moq;

namespace HotelManagement.Tests.Reservations;

public class ReservationCancellationTests
{
    private static readonly DateOnly Today = new(2026, 9, 1);

    [Fact]
    public async Task CancelReservation_WhenConfirmed_SucceedsAndNotifies()
    {
        var hotel = new TestHotel(Today);
        var reservation = hotel.AddReservation(new DateOnly(2026, 9, 3), 4, ReservationStatus.Confirmed);

        var result = await new CancelReservationCommandHandler(hotel.Reservations, hotel.Recorder)
            .Handle(new CancelReservationCommand(reservation.Id), CancellationToken.None);

        Assert.Equal("Cancelled", result.Status);
        hotel.SignalR.Verify(s => s.NotifyReservationUpdated(It.Is<ReservationDto>(r => r.Id == reservation.Id), "Cancelled"), Times.Once);
    }

    [Theory]
    [InlineData(ReservationStatus.Cancelled)]
    [InlineData(ReservationStatus.CheckedIn)]
    [InlineData(ReservationStatus.CheckedOut)]
    [InlineData(ReservationStatus.NoShow)]
    public async Task CancelReservation_WhenNotConfirmed_ThrowsConflictException(ReservationStatus status)
    {
        var hotel = new TestHotel(Today);
        var reservation = hotel.AddReservation(new DateOnly(2026, 8, 30), 4, status);

        await Assert.ThrowsAsync<ConflictException>(() =>
            new CancelReservationCommandHandler(hotel.Reservations, hotel.Recorder)
                .Handle(new CancelReservationCommand(reservation.Id), CancellationToken.None));
    }
}
