using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.Common.Services;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Enums;
using MediatR;

namespace HotelManagement.Application.Commands.Reservations;

public record CheckInReservationCommand(int Id) : IRequest<ReservationDetailDto>;

public class CheckInReservationCommandHandler : IRequestHandler<CheckInReservationCommand, ReservationDetailDto>
{
    private readonly IReservationRepository _reservationRepository;
    private readonly ReservationChangeRecorder _recorder;
    private readonly IClock _clock;

    public CheckInReservationCommandHandler(
        IReservationRepository reservationRepository,
        ReservationChangeRecorder recorder,
        IClock clock)
    {
        _reservationRepository = reservationRepository;
        _recorder = recorder;
        _clock = clock;
    }

    public async Task<ReservationDetailDto> Handle(CheckInReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Reservation", request.Id);

        if (reservation.Status != ReservationStatus.Confirmed)
        {
            throw new ConflictException($"Only confirmed reservations can be checked in. This one is {reservation.Status}.");
        }

        var today = _clock.Today;
        if (today < reservation.CheckInDate)
        {
            throw new ConflictException($"Check-in opens on {reservation.CheckInDate:yyyy-MM-dd}.");
        }

        if (today >= reservation.CheckOutDate)
        {
            throw new ConflictException("The stay dates have passed. Mark the reservation as a no-show instead.");
        }

        reservation.Status = ReservationStatus.CheckedIn;
        reservation.CheckedInAt = _clock.UtcNow;

        return await _recorder.SaveAsync(
            reservation,
            "Checked in",
            $"Checked in guest '{reservation.Guest.FullName}' to room {reservation.Room.RoomNumber} (reservation #{reservation.Id})",
            cancellationToken);
    }
}
