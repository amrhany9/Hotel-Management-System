import type { User } from './user';

export class AuditLog {
  id: number;
  action = '';
  entityName = '';
  entityId = '';

  userId: number;
  user?: User;

  actionDate: Date = new Date();
  details = '';
}
