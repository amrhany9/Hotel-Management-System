import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IMediator } from '../../application/common/mediator/mediator';
import { AuditLogDto } from '../../application/dtos/audit-logs/audit-log.dto';
import { GetAuditLogsQuery } from '../../application/queries/audit-logs/get-audit-logs.query';
import { OptionalIntPipe } from '../binding/query-parameter.pipes';

@ApiTags('AuditLogs')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly mediator: IMediator) {}

  @Get()
  getAll(@Query('take', OptionalIntPipe) take?: number): Promise<AuditLogDto[]> {
    return this.mediator.send(new GetAuditLogsQuery(take ?? 100));
  }
}
