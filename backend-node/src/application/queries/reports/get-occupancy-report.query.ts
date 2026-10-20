import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import type { DateOnly } from '../../../domain/common/date-only';
import { ValidationException } from '../../common/exceptions/validation.exception';
import { IReportRepository } from '../../common/interfaces/repositories/report.repository';
import { OccupancyReportItemDto } from '../../dtos/reports/occupancy-report-item.dto';

export class GetOccupancyReportQuery extends Query<OccupancyReportItemDto[]> {
  constructor(
    public readonly from: DateOnly,
    public readonly to: DateOnly,
  ) {
    super();
  }
}

@QueryHandler(GetOccupancyReportQuery)
export class GetOccupancyReportQueryHandler implements IQueryHandler<GetOccupancyReportQuery, OccupancyReportItemDto[]> {
  constructor(private readonly reportRepository: IReportRepository) {}

  execute(request: GetOccupancyReportQuery): Promise<OccupancyReportItemDto[]> {
    if (request.to <= request.from) {
      throw ValidationException.forProperty('To', 'To date must be after From date.');
    }
    return this.reportRepository.getOccupancyReport(request.from, request.to);
  }
}
