import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuditLog } from '../models/audit-log.models';
import { API_ENDPOINTS } from '../constants/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private http = inject(HttpClient);

  getAuditLogs(take = 100): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(API_ENDPOINTS.auditLogs.base(take));
  }
}
