import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReportService, ReservationService, RoomService } from '../../core/services/api.services';
import { SignalRService } from '../../core/services/signalr.service';
import { DashboardStats, Reservation, TopRoomReport } from '../../core/models/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import {
  UiButtonComponent,
  UiCardComponent,
  UiStatCardComponent,
  UiBadgeComponent,
} from '../../shared/components/ui';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    UiButtonComponent,
    UiCardComponent,
    UiStatCardComponent,
    UiBadgeComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  router = inject(Router);
  private reportService = inject(ReportService);
  private reservationService = inject(ReservationService);
  private signalRService = inject(SignalRService);

  stats = signal<DashboardStats | null>(null);
  recentReservations = signal<Reservation[]>([]);
  topRooms = signal<TopRoomReport[]>([]);

  maxTopRoomRevenue = computed(() => {
    const rooms = this.topRooms();
    if (!rooms.length) return 1;
    return Math.max(...rooms.map((r) => r.totalRevenue), 1);
  });

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.loadData();

    // Subscribe to SignalR events for automatic live dashboard updates
    this.subs.push(
      this.signalRService.reservationCreated$.subscribe(() => this.loadData()),
      this.signalRService.reservationCancelled$.subscribe(() => this.loadData()),
      this.signalRService.roomCreated$.subscribe(() => this.loadData()),
      this.signalRService.roomUpdated$.subscribe(() => this.loadData()),
      this.signalRService.roomDeleted$.subscribe(() => this.loadData())
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadData(): void {
    this.reportService.getDashboardStats().subscribe({
      next: (res) => this.stats.set(res),
      error: (err) => console.error('Failed to load dashboard stats', err),
    });

    this.reservationService.getReservations().subscribe({
      next: (res) => this.recentReservations.set(res.slice(0, 5)),
      error: (err) => console.error('Failed to load recent reservations', err),
    });

    this.reportService.getTopRooms(5).subscribe({
      next: (res) => this.topRooms.set(res),
      error: (err) => console.error('Failed to load top rooms', err),
    });
  }
}
