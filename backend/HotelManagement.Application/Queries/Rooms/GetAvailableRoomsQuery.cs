using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Queries.Rooms;

public record GetAvailableRoomsQuery(
    string? RoomType = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    DateOnly? CheckIn = null,
    DateOnly? CheckOut = null) : IRequest<List<RoomDto>>;

public class GetAvailableRoomsQueryHandler : IRequestHandler<GetAvailableRoomsQuery, List<RoomDto>>
{
    private readonly IRoomRepository _roomRepository;

    public GetAvailableRoomsQueryHandler(IRoomRepository roomRepository)
    {
        _roomRepository = roomRepository;
    }

    public async Task<List<RoomDto>> Handle(GetAvailableRoomsQuery request, CancellationToken cancellationToken)
    {
        if (request.CheckIn.HasValue && request.CheckOut.HasValue && request.CheckOut.Value <= request.CheckIn.Value)
        {
            throw new ValidationException("CheckOut", "Check-out date must be after check-in date.");
        }

        var rooms = await _roomRepository.GetAvailableRoomsAsync(
            request.RoomType,
            request.MinPrice,
            request.MaxPrice,
            request.CheckIn,
            request.CheckOut,
            cancellationToken);

        return rooms.Select(r => new RoomDto
        {
            Id = r.Id,
            RoomNumber = r.RoomNumber,
            RoomType = r.RoomType,
            PricePerNight = r.PricePerNight,
            IsAvailable = r.IsAvailable,
            CreatedAt = r.CreatedAt
        }).ToList();
    }
}
