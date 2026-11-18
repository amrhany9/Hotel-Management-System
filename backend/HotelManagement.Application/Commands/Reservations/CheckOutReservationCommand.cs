using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.Common.Services;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Enums;
using MediatR;

namespace HotelManagement.Application.Commands.Reservations;

public record CheckOutReservationCommand(int Id) : IRequest<ReservationDetailDto>;

public class CheckOutReservationCommandHandler : IRequestHandler<CheckOutReservationCommand, ReservationDetailDto>
{
    private readonly IReservationRepository _reservationRepository;
    private readonly ReservationChangeRecorder _recorder;
    private readonly IClock _clock;

    public CheckOutReservationCommandHandler(
        IReservationRepository reservationRepository,
        ReservationChangeRecorder recorder,
        IClock clock)
    {
        _reservationRepository = reservationRepository;
        _recorder = recorder;
        _clock = clock;
    }

    public async Task<ReservationDetailDto> Handle(CheckOutReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Reservation", request.Id);

        if (reservation.Status != ReservationStatus.CheckedIn)
        {
            throw new ConflictException($"Only checked-in guests can be checked out. This reservation is {reservation.Status}.");
        }

        if (reservation.Balance > 0)
        {
            throw new ConflictException($"The guest has an outstanding balance of {Money.Format(reservation.Balance)}. Record the payment before check-out.");
        }

        reservation.Status = ReservationStatus.CheckedOut;
        reservation.CheckedOutAt = _clock.UtcNow;

        return await _recorder.SaveAsync(
            reservation,
            "Checked out",
            $"Checked out guest '{reservation.Guest.FullName}' from room {reservation.Room.RoomNumber} (reservation #{reservation.Id})",
            cancellationToken);
    }
}
