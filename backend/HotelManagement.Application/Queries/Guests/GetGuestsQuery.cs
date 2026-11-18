using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using HotelManagement.Domain.Entities;
using MediatR;

namespace HotelManagement.Application.Queries.Guests;

public record GetGuestsQuery(string? Search = null) : IRequest<List<GuestDto>>;

public class GetGuestsQueryHandler : IRequestHandler<GetGuestsQuery, List<GuestDto>>
{
    private readonly IGuestRepository _guestRepository;

    public GetGuestsQueryHandler(IGuestRepository guestRepository)
    {
        _guestRepository = guestRepository;
    }

    public async Task<List<GuestDto>> Handle(GetGuestsQuery request, CancellationToken cancellationToken)
    {
        var guests = await _guestRepository.SearchAsync(request.Search, cancellationToken);
        return guests.Select(GuestMapping.ToDto).ToList();
    }
}

internal static class GuestMapping
{
    public static GuestDto ToDto(Guest guest)
    {
        var stays = guest.Reservations.Where(r => Reservation.CountsAsStay(r.Status)).ToList();
        return new GuestDto
        {
            Id = guest.Id,
            FullName = guest.FullName,
            Phone = guest.Phone,
            Email = guest.Email,
            IdNumber = guest.IdNumber,
            TotalStays = stays.Count,
            TotalPaid = guest.Reservations.SelectMany(r => r.Payments).Sum(p => p.Amount),
            LastStay = stays.Count > 0 ? stays.Max(r => r.CheckInDate) : null,
            CreatedAt = guest.CreatedAt
        };
    }
}
