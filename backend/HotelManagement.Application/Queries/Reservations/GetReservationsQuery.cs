using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.Common.Mappings;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Enums;
using MediatR;

namespace HotelManagement.Application.Queries.Reservations;

public record GetReservationsQuery(
    string? Guest = null,
    string? RoomNumber = null,
    DateOnly? CheckInDate = null,
    DateOnly? CheckOutDate = null,
    string? Status = null) : IRequest<List<ReservationDto>>;

public class GetReservationsQueryHandler : IRequestHandler<GetReservationsQuery, List<ReservationDto>>
{
    private readonly IReservationRepository _reservationRepository;

    public GetReservationsQueryHandler(IReservationRepository reservationRepository)
    {
        _reservationRepository = reservationRepository;
    }

    public async Task<List<ReservationDto>> Handle(GetReservationsQuery request, CancellationToken cancellationToken)
    {
        ReservationStatus? parsedStatus = null;
        if (!string.IsNullOrWhiteSpace(request.Status) &&
            Enum.TryParse<ReservationStatus>(request.Status.Trim(), true, out var parsed))
        {
            parsedStatus = parsed;
        }

        var list = await _reservationRepository.SearchAsync(
            request.Guest,
            request.RoomNumber,
            request.CheckInDate,
            request.CheckOutDate,
            parsedStatus,
            cancellationToken);

        return list.Select(ReservationMapper.ToDto).ToList();
    }
}
