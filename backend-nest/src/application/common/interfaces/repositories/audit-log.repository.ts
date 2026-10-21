import type { AuditLog } from '../../../../domain/entities/audit-log';

export abstract class IAuditLogRepository {
  abstract add(log: AuditLog): Promise<AuditLog>;
  abstract getRecent(take: number): Promise<AuditLog[]>;
}
