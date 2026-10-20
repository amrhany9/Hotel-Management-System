import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { IReportRepository } from '../../common/interfaces/repositories/report.repository';
import { TopRoomReportDto } from '../../dtos/reports/top-room-report.dto';

export class GetTopRoomsReportQuery extends Query<TopRoomReportDto[]> {
  constructor(public readonly take = 5) {
    super();
  }
}

@QueryHandler(GetTopRoomsReportQuery)
export class GetTopRoomsReportQueryHandler implements IQueryHandler<GetTopRoomsReportQuery, TopRoomReportDto[]> {
  constructor(private readonly reportRepository: IReportRepository) {}

  execute(request: GetTopRoomsReportQuery): Promise<TopRoomReportDto[]> {
    return this.reportRepository.getTopRooms(request.take);
  }
}
