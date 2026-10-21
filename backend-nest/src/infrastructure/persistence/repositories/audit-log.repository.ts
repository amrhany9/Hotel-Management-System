import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IAuditLogRepository } from '../../../application/common/interfaces/repositories/audit-log.repository';
import { AuditLog } from '../../../domain/entities/audit-log';
import { UnitOfWork } from './unit-of-work';

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  private get auditLogs(): Repository<AuditLog> {
    return this.unitOfWork.manager.getRepository(AuditLog);
  }

  add(log: AuditLog): Promise<AuditLog> {
    log.details = log.details.slice(0, 1000);
    return this.auditLogs.save(log);
  }

  getRecent(take: number): Promise<AuditLog[]> {
    const limit = take > 0 ? Math.min(take, 500) : 100;
    return this.auditLogs.find({
      relations: { user: true },
      order: { actionDate: 'DESC', id: 'DESC' },
      take: limit,
    });
  }
}
