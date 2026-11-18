import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReportService, ReservationService } from '../../core/services/api.services';
import { SignalRService } from '../../core/services/signalr.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardStats, Reservation, TopRoomReport } from '../../core/models/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { statusKey, statusVariant, todayIso } from '../../shared/reservation-status';
import { UiBadgeComponent, UiButtonComponent, UiCardComponent, UiStatCardComponent } from '../../shared/components/ui';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MoneyPipe, UiButtonComponent, UiCardComponent, UiStatCardComponent, UiBadgeComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  router = inject(Router);
  authService = inject(AuthService);
  private reportService = inject(ReportService);
  private reservationService = inject(ReservationService);
  private signalRService = inject(SignalRService);

  readonly today = todayIso();
  readonly statusKey = statusKey;
  readonly statusVariant = statusVariant;

  stats = signal<DashboardStats | null>(null);
  reservations = signal<Reservation[]>([]);
  topRooms = signal<TopRoomReport[]>([]);

  todaysMovements = computed(() =>
    this.reservations()
      .filter(
        (r) =>
          (r.status === 'Confirmed' && r.checkInDate === this.today) ||
          (r.status === 'CheckedIn' && r.checkOutDate <= this.today)
      )
      .sort((a, b) => a.status.localeCompare(b.status) || a.roomNumber.localeCompare(b.roomNumber))
  );

  maxTopRoomRevenue = computed(() => Math.max(...this.topRooms().map((r) => r.totalRevenue), 1));

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.loadData();
    this.subs.push(
      this.signalRService.reservationCreated$.subscribe(() => this.loadData()),
      this.signalRService.reservationUpdated$.subscribe(() => this.loadData()),
      this.signalRService.roomCreated$.subscribe(() => this.loadData()),
      this.signalRService.roomUpdated$.subscribe(() => this.loadData()),
      this.signalRService.roomDeleted$.subscribe(() => this.loadData())
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  isArrival(r: Reservation): boolean {
    return r.status === 'Confirmed';
  }

  loadData(): void {
    this.reportService.getDashboardStats().subscribe({
      next: (res) => this.stats.set(res),
      error: (err) => console.error('Failed to load dashboard stats', err),
    });
    this.reservationService.getReservations().subscribe({
      next: (res) => this.reservations.set(res),
      error: (err) => console.error('Failed to load reservations', err),
    });
    this.reportService.getTopRooms(5).subscribe({
      next: (res) => this.topRooms.set(res),
      error: (err) => console.error('Failed to load top rooms', err),
    });
  }
}
