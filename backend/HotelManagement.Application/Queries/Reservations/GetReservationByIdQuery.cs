using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Queries.Reservations;

public record GetReservationByIdQuery(int Id) : IRequest<ReservationDto>;

public class GetReservationByIdQueryHandler : IRequestHandler<GetReservationByIdQuery, ReservationDto>
{
    private readonly IReservationRepository _reservationRepository;

    public GetReservationByIdQueryHandler(IReservationRepository reservationRepository)
    {
        _reservationRepository = reservationRepository;
    }

    public async Task<ReservationDto> Handle(GetReservationByIdQuery request, CancellationToken cancellationToken)
    {
        var r = await _reservationRepository.GetByIdAsync(request.Id, cancellationToken);

        if (r == null)
        {
            throw new NotFoundException("Reservation", request.Id);
        }

        return new ReservationDto
        {
            Id = r.Id,
            RoomId = r.RoomId,
            RoomNumber = r.Room?.RoomNumber ?? string.Empty,
            RoomType = r.Room?.RoomType ?? string.Empty,
            GuestName = r.GuestName,
            CheckInDate = r.CheckInDate,
            CheckOutDate = r.CheckOutDate,
            Nights = r.CheckOutDate.DayNumber - r.CheckInDate.DayNumber,
            TotalAmount = r.TotalAmount,
            Status = r.Status.ToString(),
            CreatedBy = r.CreatedBy,
            CreatedByName = r.User?.FullName ?? $"User #{r.CreatedBy}",
            CreatedAt = r.CreatedAt
        };
    }
}
