import { EntitySchema } from 'typeorm';
import { AuditLog } from '../../../domain/entities/audit-log';

export const AuditLogConfiguration = new EntitySchema<AuditLog>({
  name: 'AuditLog',
  target: AuditLog,
  tableName: 'AuditLogs',
  columns: {
    id: { name: 'Id', type: 'int', primary: true, generated: 'increment' },
    action: { name: 'Action', type: 'nvarchar', length: 50 },
    entityName: { name: 'EntityName', type: 'nvarchar', length: 50 },
    entityId: { name: 'EntityId', type: 'nvarchar', length: 50 },
    userId: { name: 'UserId', type: 'int' },
    actionDate: { name: 'ActionDate', type: 'datetime' },
    details: { name: 'Details', type: 'nvarchar', length: 1000 },
  },
  indices: [{ name: 'IX_AuditLogs_UserId', columns: ['userId'] }],
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      inverseSide: 'auditLogs',
      joinColumn: { name: 'UserId', foreignKeyConstraintName: 'FK_AuditLogs_Users_UserId' },
      onDelete: 'NO ACTION',
    },
  },
});
