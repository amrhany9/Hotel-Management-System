using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Queries.Reports;

public record GetDashboardStatsQuery : IRequest<DashboardStatsDto>;

public class GetDashboardStatsQueryHandler : IRequestHandler<GetDashboardStatsQuery, DashboardStatsDto>
{
    private readonly IReportRepository _reportRepository;

    public GetDashboardStatsQueryHandler(IReportRepository reportRepository)
    {
        _reportRepository = reportRepository;
    }

    public async Task<DashboardStatsDto> Handle(GetDashboardStatsQuery request, CancellationToken cancellationToken)
    {
        return await _reportRepository.GetDashboardStatsAsync(cancellationToken);
    }
}
