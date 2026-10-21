import type { AuditLog } from './audit-log';
import type { Reservation } from './reservation';

export class User {
  id: number;
  fullName = '';
  email = '';
  passwordHash = '';
  isActive = true;
  createdAt: Date = new Date();

  reservations?: Reservation[];
  auditLogs?: AuditLog[];
}
