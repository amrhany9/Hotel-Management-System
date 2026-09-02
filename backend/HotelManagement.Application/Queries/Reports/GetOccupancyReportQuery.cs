using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Queries.Reports;

public record GetOccupancyReportQuery(DateOnly From, DateOnly To) : IRequest<List<OccupancyReportItemDto>>;

public class GetOccupancyReportQueryHandler : IRequestHandler<GetOccupancyReportQuery, List<OccupancyReportItemDto>>
{
    private readonly IReportRepository _reportRepository;

    public GetOccupancyReportQueryHandler(IReportRepository reportRepository)
    {
        _reportRepository = reportRepository;
    }

    public async Task<List<OccupancyReportItemDto>> Handle(GetOccupancyReportQuery request, CancellationToken cancellationToken)
    {
        if (request.To <= request.From)
        {
            throw new ValidationException("To", "To date must be after From date.");
        }

        return await _reportRepository.GetOccupancyReportAsync(request.From, request.To, cancellationToken);
    }
}
