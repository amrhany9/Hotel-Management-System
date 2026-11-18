using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.Common.Services;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Enums;
using MediatR;

namespace HotelManagement.Application.Commands.Reservations;

public record CancelReservationCommand(int Id) : IRequest<ReservationDetailDto>;

public class CancelReservationCommandHandler : IRequestHandler<CancelReservationCommand, ReservationDetailDto>
{
    private readonly IReservationRepository _reservationRepository;
    private readonly ReservationChangeRecorder _recorder;

    public CancelReservationCommandHandler(IReservationRepository reservationRepository, ReservationChangeRecorder recorder)
    {
        _reservationRepository = reservationRepository;
        _recorder = recorder;
    }

    public async Task<ReservationDetailDto> Handle(CancelReservationCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Reservation", request.Id);

        if (reservation.Status != ReservationStatus.Confirmed)
        {
            throw new ConflictException($"Only confirmed reservations can be cancelled. This one is {reservation.Status}.");
        }

        reservation.Status = ReservationStatus.Cancelled;

        return await _recorder.SaveAsync(
            reservation,
            "Cancelled",
            $"Cancelled reservation #{reservation.Id} for guest '{reservation.Guest.FullName}' (Room {reservation.Room.RoomNumber})",
            cancellationToken);
    }
}
