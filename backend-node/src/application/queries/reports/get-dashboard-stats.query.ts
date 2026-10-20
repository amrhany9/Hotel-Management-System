import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { IReportRepository } from '../../common/interfaces/repositories/report.repository';
import { DashboardStatsDto } from '../../dtos/reports/dashboard-stats.dto';

export class GetDashboardStatsQuery extends Query<DashboardStatsDto> {}

@QueryHandler(GetDashboardStatsQuery)
export class GetDashboardStatsQueryHandler implements IQueryHandler<GetDashboardStatsQuery, DashboardStatsDto> {
  constructor(private readonly reportRepository: IReportRepository) {}

  execute(): Promise<DashboardStatsDto> {
    return this.reportRepository.getDashboardStats();
  }
}
