using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.Common.Services;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Enums;
using MediatR;

namespace HotelManagement.Application.Commands.Reservations;

public record MarkNoShowCommand(int Id) : IRequest<ReservationDetailDto>;

public class MarkNoShowCommandHandler : IRequestHandler<MarkNoShowCommand, ReservationDetailDto>
{
    private readonly IReservationRepository _reservationRepository;
    private readonly ReservationChangeRecorder _recorder;
    private readonly IClock _clock;

    public MarkNoShowCommandHandler(
        IReservationRepository reservationRepository,
        ReservationChangeRecorder recorder,
        IClock clock)
    {
        _reservationRepository = reservationRepository;
        _recorder = recorder;
        _clock = clock;
    }

    public async Task<ReservationDetailDto> Handle(MarkNoShowCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Reservation", request.Id);

        if (reservation.Status != ReservationStatus.Confirmed)
        {
            throw new ConflictException($"Only confirmed reservations can be marked as a no-show. This one is {reservation.Status}.");
        }

        if (_clock.Today < reservation.CheckInDate)
        {
            throw new ConflictException("A reservation can only be marked as a no-show on or after its arrival date.");
        }

        reservation.Status = ReservationStatus.NoShow;

        return await _recorder.SaveAsync(
            reservation,
            "No-show",
            $"Marked reservation #{reservation.Id} for guest '{reservation.Guest.FullName}' as a no-show (Room {reservation.Room.RoomNumber})",
            cancellationToken);
    }
}
