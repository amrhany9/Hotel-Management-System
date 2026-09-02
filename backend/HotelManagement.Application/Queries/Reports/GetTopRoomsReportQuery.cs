using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Queries.Reports;

public record GetTopRoomsReportQuery(int Take = 5) : IRequest<List<TopRoomReportDto>>;

public class GetTopRoomsReportQueryHandler : IRequestHandler<GetTopRoomsReportQuery, List<TopRoomReportDto>>
{
    private readonly IReportRepository _reportRepository;

    public GetTopRoomsReportQueryHandler(IReportRepository reportRepository)
    {
        _reportRepository = reportRepository;
    }

    public async Task<List<TopRoomReportDto>> Handle(GetTopRoomsReportQuery request, CancellationToken cancellationToken)
    {
        return await _reportRepository.GetTopRoomsAsync(request.Take, cancellationToken);
    }
}
