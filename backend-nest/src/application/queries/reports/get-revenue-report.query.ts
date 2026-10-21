import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import type { DateOnly } from '../../../domain/common/date-only';
import { ValidationException } from '../../common/exceptions/validation.exception';
import { IReportRepository } from '../../common/interfaces/repositories/report.repository';
import { RevenueReportDto } from '../../dtos/reports/revenue-report.dto';

export class GetRevenueReportQuery extends Query<RevenueReportDto> {
  constructor(
    public readonly from: DateOnly,
    public readonly to: DateOnly,
  ) {
    super();
  }
}

@QueryHandler(GetRevenueReportQuery)
export class GetRevenueReportQueryHandler implements IQueryHandler<GetRevenueReportQuery, RevenueReportDto> {
  constructor(private readonly reportRepository: IReportRepository) {}

  execute(request: GetRevenueReportQuery): Promise<RevenueReportDto> {
    if (request.to <= request.from) {
      throw ValidationException.forProperty('To', 'To date must be after From date.');
    }
    return this.reportRepository.getRevenueReport(request.from, request.to);
  }
}
