using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.Common.Mappings;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Queries.Reservations;

public record GetReservationByIdQuery(int Id) : IRequest<ReservationDetailDto>;

public class GetReservationByIdQueryHandler : IRequestHandler<GetReservationByIdQuery, ReservationDetailDto>
{
    private readonly IReservationRepository _reservationRepository;

    public GetReservationByIdQueryHandler(IReservationRepository reservationRepository)
    {
        _reservationRepository = reservationRepository;
    }

    public async Task<ReservationDetailDto> Handle(GetReservationByIdQuery request, CancellationToken cancellationToken)
    {
        var reservation = await _reservationRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Reservation", request.Id);

        return ReservationMapper.ToDetailDto(reservation);
    }
}
