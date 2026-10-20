import type { AuditLog } from '../../../domain/entities/audit-log';

export class AuditLogDto {
  id: number;
  action: string;
  entityName: string;
  entityId: string;
  userId: number;
  userName: string;
  actionDate: Date;
  details: string;

  static from(log: AuditLog): AuditLogDto {
    return {
      id: log.id,
      action: log.action,
      entityName: log.entityName,
      entityId: log.entityId,
      userId: log.userId,
      userName: log.user?.fullName ?? `User #${log.userId}`,
      actionDate: log.actionDate,
      details: log.details,
    };
  }
}
