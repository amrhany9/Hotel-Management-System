using HotelManagement.Application.Common;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Queries.Guests;

public record GetGuestByPhoneQuery(string Phone) : IRequest<GuestDto?>;

public class GetGuestByPhoneQueryHandler : IRequestHandler<GetGuestByPhoneQuery, GuestDto?>
{
    private readonly IGuestRepository _guestRepository;

    public GetGuestByPhoneQueryHandler(IGuestRepository guestRepository)
    {
        _guestRepository = guestRepository;
    }

    public async Task<GuestDto?> Handle(GetGuestByPhoneQuery request, CancellationToken cancellationToken)
    {
        var phone = PhoneNumber.Normalize(request.Phone);
        if (phone.Length < 7)
        {
            return null;
        }

        var guest = await _guestRepository.GetByPhoneAsync(phone, cancellationToken);
        return guest == null ? null : GuestMapping.ToDto(guest);
    }
}
