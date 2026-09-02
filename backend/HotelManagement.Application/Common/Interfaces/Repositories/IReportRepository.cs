using HotelManagement.Application.DTOs;

namespace HotelManagement.Application.Common.Interfaces.Repositories;

public interface IReportRepository
{
    Task<List<TopRoomReportDto>> GetTopRoomsAsync(int take, CancellationToken cancellationToken = default);
    Task<RevenueReportDto> GetRevenueReportAsync(DateOnly from, DateOnly to, CancellationToken cancellationToken = default);
    Task<List<OccupancyReportItemDto>> GetOccupancyReportAsync(DateOnly from, DateOnly to, CancellationToken cancellationToken = default);
    Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken cancellationToken = default);
}
