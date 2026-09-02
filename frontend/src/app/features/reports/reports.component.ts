import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/api.services';
import { TopRoomReport, RevenueReport, OccupancyReportItem } from '../../core/models/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import {
  UiButtonComponent,
  UiCardComponent,
  UiInputComponent,
  UiStatCardComponent,
} from '../../shared/components/ui';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    UiButtonComponent,
    UiCardComponent,
    UiInputComponent,
    UiStatCardComponent,
  ],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);

  activeTab: 'top-rooms' | 'revenue' | 'occupancy' = 'top-rooms';

  topRooms = signal<TopRoomReport[]>([]);
  revenueReport = signal<RevenueReport | null>(null);
  occupancyReport = signal<OccupancyReportItem[]>([]);

  revenueFrom = '';
  revenueTo = '';
  occupancyFrom = '';
  occupancyTo = '';

  ngOnInit(): void {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.revenueFrom = this.formatDate(start);
    this.revenueTo = this.formatDate(end);
    this.occupancyFrom = this.formatDate(start);
    this.occupancyTo = this.formatDate(end);

    this.loadTopRooms();
    this.loadRevenueReport();
    this.loadOccupancyReport();
  }

  loadTopRooms(): void {
    this.reportService.getTopRooms(5).subscribe({
      next: (data) => this.topRooms.set(data),
      error: (err) => console.error(err),
    });
  }

  loadRevenueReport(): void {
    if (!this.revenueFrom || !this.revenueTo) return;
    this.reportService.getRevenue(this.revenueFrom, this.revenueTo).subscribe({
      next: (data) => this.revenueReport.set(data),
      error: (err) => console.error(err),
    });
  }

  loadOccupancyReport(): void {
    if (!this.occupancyFrom || !this.occupancyTo) return;
    this.reportService.getOccupancy(this.occupancyFrom, this.occupancyTo).subscribe({
      next: (data) => this.occupancyReport.set(data),
      error: (err) => console.error(err),
    });
  }

  private formatDate(d: Date): string {
    return d.toISOString().split('T')[0];
  }
}
