using HotelManagement.Application.Common.Exceptions;
using HotelManagement.Application.Common.Interfaces.Repositories;
using HotelManagement.Application.DTOs;
using MediatR;

namespace HotelManagement.Application.Queries.Reports;

public record GetRevenueReportQuery(DateOnly From, DateOnly To) : IRequest<RevenueReportDto>;

public class GetRevenueReportQueryHandler : IRequestHandler<GetRevenueReportQuery, RevenueReportDto>
{
    private readonly IReportRepository _reportRepository;

    public GetRevenueReportQueryHandler(IReportRepository reportRepository)
    {
        _reportRepository = reportRepository;
    }

    public async Task<RevenueReportDto> Handle(GetRevenueReportQuery request, CancellationToken cancellationToken)
    {
        if (request.To <= request.From)
        {
            throw new ValidationException("To", "To date must be after From date.");
        }

        return await _reportRepository.GetRevenueReportAsync(request.From, request.To, cancellationToken);
    }
}
