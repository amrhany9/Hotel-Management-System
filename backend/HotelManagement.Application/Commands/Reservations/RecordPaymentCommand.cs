using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.Common.Services;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Entities;
using HotelManagement.Domain.Enums;
using MediatR;

namespace HotelManagement.Application.Commands.Reservations;

public record RecordPaymentCommand(int ReservationId, decimal Amount, PaymentMethod Method, string? Reference) : IRequest<ReservationDetailDto>;

public class RecordPaymentCommandHandler : IRequestHandler<RecordPaymentCommand, ReservationDetailDto>
{
    private readonly IReservationRepository _reservationRepository;
    private readonly IUserRepository _userRepository;
    private readonly ReservationChangeRecorder _recorder;
    private readonly IClock _clock;

    public RecordPaymentCommandHandler(
        IReservationRepository reservationRepository,
        IUserRepository userRepository,
        ReservationChangeRecorder recorder,
        IClock clock)
    {
        _reservationRepository = reservationRepository;
        _userRepository = userRepository;
        _recorder = recorder;
        _clock = clock;
    }

    public async Task<ReservationDetailDto> Handle(RecordPaymentCommand request, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepository.GetByIdAsync(request.ReservationId, cancellationToken)
            ?? throw new NotFoundException("Reservation", request.ReservationId);

        if (reservation.Status is ReservationStatus.Cancelled or ReservationStatus.NoShow)
        {
            throw new ConflictException($"Payments can't be recorded on a {reservation.Status} reservation.");
        }

        if (request.Amount > reservation.Balance)
        {
            throw new ConflictException($"The payment is more than the outstanding balance of {Money.Format(reservation.Balance)}.");
        }

        var userId = _recorder.CurrentUserId;
        reservation.Payments.Add(new Payment
        {
            Amount = request.Amount,
            Method = request.Method,
            Reference = string.IsNullOrWhiteSpace(request.Reference) ? null : request.Reference.Trim(),
            PaidAt = _clock.UtcNow,
            ReceivedBy = userId,
            ReceivedByUser = (await _userRepository.GetByIdAsync(userId, cancellationToken))!
        });

        return await _recorder.SaveAsync(
            reservation,
            "Payment",
            $"Recorded {request.Method} payment of {Money.Format(request.Amount)} for reservation #{reservation.Id} ('{reservation.Guest.FullName}')",
            cancellationToken);
    }
}
