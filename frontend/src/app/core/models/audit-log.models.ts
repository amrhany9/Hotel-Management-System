export interface AuditLog {
  id: number;
  action: string;
  entityName: string;
  entityId: string;
  userId: number;
  userName?: string;
  actionDate: string;
  details: string;
}
