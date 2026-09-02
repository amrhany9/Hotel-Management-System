import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService } from '../../core/services/api.services';
import { AuditLog } from '../../core/models/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import {
  UiButtonComponent,
  UiCardComponent,
  UiBadgeComponent,
  UiInputComponent,
  BadgeVariant,
} from '../../shared/components/ui';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    UiButtonComponent,
    UiCardComponent,
    UiBadgeComponent,
    UiInputComponent,
  ],
  templateUrl: './audit-logs.component.html',
})
export class AuditLogsComponent implements OnInit {
  private auditLogService = inject(AuditLogService);

  logs = signal<AuditLog[]>([]);
  filteredLogs = signal<AuditLog[]>([]);
  searchQuery = '';

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.auditLogService.getAuditLogs(100).subscribe({
      next: (data) => {
        this.logs.set(data);
        this.filterLogs();
      },
      error: (err) => console.error('Failed to load audit logs', err),
    });
  }

  filterLogs(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) {
      this.filteredLogs.set(this.logs());
      return;
    }

    const filtered = this.logs().filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.entityName.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        (l.userName?.toLowerCase().includes(q) ?? false)
    );
    this.filteredLogs.set(filtered);
  }

  getActionVariant(action: string): BadgeVariant {
    switch (action.toLowerCase()) {
      case 'created':
        return 'success';
      case 'updated':
        return 'warning';
      case 'deleted':
      case 'cancelled':
        return 'danger';
      default:
        return 'info';
    }
  }
}
