import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/api.services';
import { TopRoomReport, RevenueReport, OccupancyReportItem } from '../../core/models/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { roomTypeVariant } from '../../shared/room-type';
import { localIsoDate } from '../../shared/reservation-status';
import {
  UiBadgeComponent,
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
    MoneyPipe,
    UiBadgeComponent,
    UiButtonComponent,
    UiCardComponent,
    UiInputComponent,
    UiStatCardComponent,
  ],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit {
  readonly roomTypeVariant = roomTypeVariant;

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

    this.revenueFrom = localIsoDate(start);
    this.revenueTo = localIsoDate(end);
    this.occupancyFrom = localIsoDate(start);
    this.occupancyTo = localIsoDate(end);

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
}
