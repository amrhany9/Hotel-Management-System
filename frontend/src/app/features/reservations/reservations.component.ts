import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ReservationService, RoomService } from '../../core/services/api.services';
import { SignalRService } from '../../core/services/signalr.service';
import { NotificationService } from '../../core/services/notification.service';
import { Reservation, Room, CreateReservationRequest } from '../../core/models/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import {
  UiButtonComponent,
  UiCardComponent,
  UiBadgeComponent,
  UiModalComponent,
  UiInputComponent,
  UiComboboxComponent,
  ComboboxOption,
} from '../../shared/components/ui';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    UiButtonComponent,
    UiCardComponent,
    UiBadgeComponent,
    UiModalComponent,
    UiInputComponent,
    UiComboboxComponent,
  ],
  templateUrl: './reservations.component.html',
})
export class ReservationsComponent implements OnInit, OnDestroy {
  private reservationService = inject(ReservationService);
  private roomService = inject(RoomService);
  private signalRService = inject(SignalRService);
  private notificationService = inject(NotificationService);

  reservations = signal<Reservation[]>([]);
  filteredReservations = signal<Reservation[]>([]);
  availableRooms = signal<Room[]>([]);
  submitting = signal(false);
  cancelling = signal(false);

  // Filters
  filterGuestName = '';
  filterRoomNumber = '';
  filterStatus: any = null;
  filterCheckIn = '';

  statusOptions: ComboboxOption[] = [
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Cancelled', value: 'Cancelled' },
  ];

  get activeFilterCount(): number {
    let count = 0;
    if (this.filterGuestName.trim()) count++;
    if (this.filterRoomNumber.trim()) count++;
    if (this.filterStatus) count++;
    if (this.filterCheckIn) count++;
    return count;
  }

  // Create Modal state
  isCreateModalOpen = false;
  newGuestName = '';
  newRoomId: any = null;
  newCheckIn = '';
  newCheckOut = '';
  selectedRoomPrice = signal(0);
  estimatedNights = signal(0);
  estimatedTotal = signal<number | null>(null);

  // Cancel Modal state
  isCancelModalOpen = false;
  resToCancel: Reservation | null = null;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.loadReservations();
    this.loadRooms();

    this.subs.push(
      this.signalRService.reservationCreated$.subscribe(() => this.loadReservations()),
      this.signalRService.reservationCancelled$.subscribe(() => this.loadReservations())
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadReservations(): void {
    this.reservationService.getReservations().subscribe({
      next: (list) => {
        this.reservations.set(list);
        this.applyFilters();
      },
      error: () => this.notificationService.error('Failed to load reservations'),
    });
  }

  loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (list) => this.availableRooms.set(list),
      error: () => this.notificationService.error('Failed to load rooms'),
    });
  }

  roomComboboxOptions(): ComboboxOption[] {
    return this.availableRooms().map((r) => ({
      label: `Room ${r.roomNumber} (${r.roomType})`,
      value: r.id,
      subtext: `$${r.pricePerNight}/night`,
      badge: r.isAvailable ? 'Available' : 'Occupied',
    }));
  }

  onRoomSelected(opt: ComboboxOption | null): void {
    if (opt) {
      const room = this.availableRooms().find((r) => r.id === opt.value);
      this.selectedRoomPrice.set(room ? room.pricePerNight : 0);
    } else {
      this.selectedRoomPrice.set(0);
    }
    this.calculateLiveTotal();
  }

  calculateLiveTotal(): void {
    if (this.newCheckIn && this.newCheckOut && this.selectedRoomPrice() > 0) {
      const start = new Date(this.newCheckIn);
      const end = new Date(this.newCheckOut);
      const diffMs = end.getTime() - start.getTime();
      const nights = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (nights > 0) {
        this.estimatedNights.set(nights);
        this.estimatedTotal.set(nights * this.selectedRoomPrice());
        return;
      }
    }
    this.estimatedTotal.set(null);
  }

  applyFilters(): void {
    let result = this.reservations();
    if (this.filterGuestName.trim()) {
      const q = this.filterGuestName.trim().toLowerCase();
      result = result.filter((r) => r.guestName.toLowerCase().includes(q));
    }
    if (this.filterRoomNumber.trim()) {
      const q = this.filterRoomNumber.trim().toLowerCase();
      result = result.filter((r) => r.roomNumber.toLowerCase().includes(q));
    }
    if (this.filterStatus) {
      result = result.filter((r) => r.status.toLowerCase() === this.filterStatus.toLowerCase());
    }
    if (this.filterCheckIn) {
      result = result.filter((r) => r.checkInDate >= this.filterCheckIn);
    }
    this.filteredReservations.set(result);
  }

  resetFilters(): void {
    this.filterGuestName = '';
    this.filterRoomNumber = '';
    this.filterStatus = null;
    this.filterCheckIn = '';
    this.filteredReservations.set(this.reservations());
  }

  openCreateModal(): void {
    this.newGuestName = '';
    this.newRoomId = null;
    this.newCheckIn = '';
    this.newCheckOut = '';
    this.estimatedTotal.set(null);
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  createReservation(): void {
    if (!this.newGuestName || !this.newRoomId || !this.newCheckIn || !this.newCheckOut) {
      this.notificationService.warning('Please complete all reservation fields');
      return;
    }

    if (this.newCheckOut <= this.newCheckIn) {
      this.notificationService.warning('Check-out date must be after check-in date');
      return;
    }

    const payload: CreateReservationRequest = {
      guestName: this.newGuestName.trim(),
      roomId: Number(this.newRoomId),
      checkInDate: this.newCheckIn,
      checkOutDate: this.newCheckOut,
    };

    this.submitting.set(true);
    this.reservationService.createReservation(payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.notificationService.success(`Reservation created for ${res.guestName}`);
        this.closeCreateModal();
        this.loadReservations();
      },
      error: (err) => {
        this.submitting.set(false);
        this.notificationService.error(err.error?.detail || 'Failed to create reservation');
      },
    });
  }

  confirmCancel(res: Reservation): void {
    this.resToCancel = res;
    this.isCancelModalOpen = true;
  }

  closeCancelModal(): void {
    this.isCancelModalOpen = false;
    this.resToCancel = null;
  }

  executeCancel(): void {
    if (!this.resToCancel) return;

    this.cancelling.set(true);
    this.reservationService.cancelReservation(this.resToCancel.id).subscribe({
      next: () => {
        this.cancelling.set(false);
        this.notificationService.success('Reservation cancelled');
        this.closeCancelModal();
        this.loadReservations();
      },
      error: (err) => {
        this.cancelling.set(false);
        this.notificationService.error(err.error?.detail || 'Failed to cancel reservation');
      },
    });
  }
}
