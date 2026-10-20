import type { DateOnly } from '../../../../domain/common/date-only';
import type { DashboardStatsDto } from '../../../dtos/reports/dashboard-stats.dto';
import type { OccupancyReportItemDto } from '../../../dtos/reports/occupancy-report-item.dto';
import type { RevenueReportDto } from '../../../dtos/reports/revenue-report.dto';
import type { TopRoomReportDto } from '../../../dtos/reports/top-room-report.dto';

export abstract class IReportRepository {
  abstract getTopRooms(take: number): Promise<TopRoomReportDto[]>;
  abstract getRevenueReport(from: DateOnly, to: DateOnly): Promise<RevenueReportDto>;
  abstract getOccupancyReport(from: DateOnly, to: DateOnly): Promise<OccupancyReportItemDto[]>;
  abstract getDashboardStats(): Promise<DashboardStatsDto>;
}
