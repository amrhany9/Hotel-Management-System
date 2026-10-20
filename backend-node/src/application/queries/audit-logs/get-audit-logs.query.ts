import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { IAuditLogRepository } from '../../common/interfaces/repositories/audit-log.repository';
import { AuditLogDto } from '../../dtos/audit-logs/audit-log.dto';

export class GetAuditLogsQuery extends Query<AuditLogDto[]> {
  constructor(public readonly take = 100) {
    super();
  }
}

@QueryHandler(GetAuditLogsQuery)
export class GetAuditLogsQueryHandler implements IQueryHandler<GetAuditLogsQuery, AuditLogDto[]> {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  async execute(request: GetAuditLogsQuery): Promise<AuditLogDto[]> {
    const logs = await this.auditLogRepository.getRecent(request.take);
    return logs.map(AuditLogDto.from);
  }
}
