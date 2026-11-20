import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { GuestService, ReservationService, RoomService } from '../../core/services/api.services';
import { SignalRService } from '../../core/services/signalr.service';
import { NotificationService } from '../../core/services/notification.service';
import { TranslationService } from '../../core/services/translation.service';
import {
  CreateReservationRequest,
  PaymentMethod,
  Reservation,
  ReservationDetail,
  ReservationStatus,
  Room,
} from '../../core/models/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { DisplayDatePipe } from '../../shared/pipes/display-date.pipe';
import { RESERVATION_STATUSES, statusKey, statusVariant, todayIso } from '../../shared/reservation-status';
import {
  ComboboxOption,
  UiBadgeComponent,
  UiButtonComponent,
  UiCardComponent,
  UiComboboxComponent,
  UiInputComponent,
  UiModalComponent,
} from '../../shared/components/ui';

type StayAction = 'checkIn' | 'checkOut' | 'noShow' | 'cancel';

const ACTION_PROMPTS: Record<StayAction, { title: string; prompt: string }> = {
  checkIn: { title: 'stay.checkIn', prompt: 'stay.checkInPrompt' },
  checkOut: { title: 'stay.checkOut', prompt: 'stay.checkOutPrompt' },
  noShow: { title: 'stay.markNoShow', prompt: 'stay.noShowPrompt' },
  cancel: { title: 'reservations.cancelReservation', prompt: 'reservations.cancelPrompt' },
};

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslatePipe,
    MoneyPipe,
    DisplayDatePipe,
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
  private guestService = inject(GuestService);
  private signalRService = inject(SignalRService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);

  readonly today = todayIso();
  readonly statusKey = statusKey;
  readonly statusVariant = statusVariant;

  reservations = signal<Reservation[]>([]);
  filteredReservations = signal<Reservation[]>([]);
  rooms = signal<Room[]>([]);
  loading = signal(true);
  submitting = signal(false);
  working = signal(false);

  filterGuest = '';
  filterRoomNumber = '';
  filterStatus: ReservationStatus | null = null;
  filterCheckIn = '';

  statusOptions = computed<ComboboxOption[]>(() => {
    this.translationService.currentLang();
    return RESERVATION_STATUSES.map((s) => ({ label: this.translationService.translate(statusKey(s)), value: s }));
  });

  methodOptions = computed<ComboboxOption[]>(() => {
    this.translationService.currentLang();
    return [
      { label: this.translationService.translate('payments.cash'), value: 'Cash' },
      { label: this.translationService.translate('payments.card'), value: 'Card' },
      { label: this.translationService.translate('payments.bankTransfer'), value: 'BankTransfer' },
    ];
  });

  private readonly money = new MoneyPipe();

  roomOptions = computed<ComboboxOption[]>(() => {
    this.translationService.currentLang();
    const room = this.translationService.translate('common.room');
    const perNight = this.translationService.translate('common.perNight');
    return this.rooms()
      .filter((r) => r.isAvailable)
      .map((r) => ({
        label: `${room} ${r.roomNumber} (${r.roomType})`,
        value: r.id,
        subtext: `${this.money.transform(r.pricePerNight)} ${perNight}`,
      }));
  });

  get activeFilterCount(): number {
    return [this.filterGuest.trim(), this.filterRoomNumber.trim(), this.filterStatus, this.filterCheckIn].filter(Boolean).length;
  }

  isCreateModalOpen = false;
  newGuestPhone = '';
  newGuestName = '';
  newGuestEmail = '';
  newGuestIdNumber = '';
  newRoomId: number | null = null;
  newCheckIn = '';
  newCheckOut = '';
  newNotes = '';
  returningGuest = signal(false);
  selectedRoomPrice = signal(0);
  estimatedNights = signal(0);
  estimatedTotal = signal<number | null>(null);

  detail = signal<ReservationDetail | null>(null);
  isDetailOpen = false;
  paymentAmount: number | string = '';
  paymentMethod: PaymentMethod = 'Cash';
  paymentReference = '';

  pendingAction = signal<StayAction | null>(null);
  pendingPrompt = computed(() => {
    const action = this.pendingAction();
    return action ? ACTION_PROMPTS[action] : null;
  });

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.loadReservations();
    this.loadRooms();

    this.subs.push(
      this.signalRService.reservationCreated$.subscribe(() => this.loadReservations()),
      this.signalRService.reservationUpdated$.subscribe((event) => {
        this.loadReservations();
        const open = this.detail();
        if (open && open.id === event.reservation.id && !this.working()) {
          this.refreshDetail(open.id);
        }
      })
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
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error(this.t('toast.loadFailed'));
      },
    });
  }

  loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (list) => this.rooms.set(list),
      error: () => this.notificationService.error(this.t('toast.loadFailed')),
    });
  }

  applyFilters(): void {
    let result = this.reservations();
    const guest = this.filterGuest.trim().toLowerCase();
    if (guest) {
      const digits = guest.replace(/[^\d]/g, '');
      result = result.filter(
        (r) => r.guestName.toLowerCase().includes(guest) || (digits.length >= 3 && r.guestPhone.includes(digits))
      );
    }
    const room = this.filterRoomNumber.trim().toLowerCase();
    if (room) {
      result = result.filter((r) => r.roomNumber.toLowerCase().includes(room));
    }
    if (this.filterStatus) {
      result = result.filter((r) => r.status === this.filterStatus);
    }
    if (this.filterCheckIn) {
      result = result.filter((r) => r.checkInDate >= this.filterCheckIn);
    }
    this.filteredReservations.set(result);
  }

  resetFilters(): void {
    this.filterGuest = '';
    this.filterRoomNumber = '';
    this.filterStatus = null;
    this.filterCheckIn = '';
    this.filteredReservations.set(this.reservations());
  }

  canCheckIn(r: Reservation): boolean {
    return r.status === 'Confirmed' && r.checkInDate <= this.today && r.checkOutDate > this.today;
  }

  canCheckOut(r: Reservation): boolean {
    return r.status === 'CheckedIn';
  }

  canMarkNoShow(r: Reservation): boolean {
    return r.status === 'Confirmed' && r.checkInDate <= this.today;
  }

  canCancel(r: Reservation): boolean {
    return r.status === 'Confirmed';
  }

  canTakePayment(r: Reservation): boolean {
    return r.balance > 0 && r.status !== 'Cancelled' && r.status !== 'NoShow';
  }

  openCreateModal(): void {
    this.newGuestPhone = '';
    this.newGuestName = '';
    this.newGuestEmail = '';
    this.newGuestIdNumber = '';
    this.newRoomId = null;
    this.newCheckIn = this.today;
    this.newCheckOut = '';
    this.newNotes = '';
    this.returningGuest.set(false);
    this.selectedRoomPrice.set(0);
    this.estimatedTotal.set(null);
    this.isCreateModalOpen = true;
  }

  closeCreateModal(): void {
    this.isCreateModalOpen = false;
  }

  lookupGuest(): void {
    const phone = this.newGuestPhone.trim();
    if (phone.replace(/[^\d]/g, '').length < 7) {
      this.returningGuest.set(false);
      return;
    }
    this.guestService.lookupByPhone(phone).subscribe({
      next: (guest) => {
        this.returningGuest.set(!!guest);
        if (guest) {
          this.newGuestName = guest.fullName;
          this.newGuestEmail = guest.email ?? '';
          this.newGuestIdNumber = guest.idNumber ?? '';
        }
      },
      error: () => this.returningGuest.set(false),
    });
  }

  onRoomSelected(opt: ComboboxOption | null): void {
    const room = opt ? this.rooms().find((r) => r.id === opt.value) : undefined;
    this.selectedRoomPrice.set(room ? room.pricePerNight : 0);
    this.calculateLiveTotal();
  }

  calculateLiveTotal(): void {
    if (this.newCheckIn && this.newCheckOut && this.selectedRoomPrice() > 0) {
      const nights = Math.round((Date.parse(this.newCheckOut) - Date.parse(this.newCheckIn)) / 86_400_000);
      if (nights > 0) {
        this.estimatedNights.set(nights);
        this.estimatedTotal.set(nights * this.selectedRoomPrice());
        return;
      }
    }
    this.estimatedTotal.set(null);
  }

  createReservation(): void {
    if (!this.newGuestName.trim() || !this.newGuestPhone.trim() || !this.newRoomId || !this.newCheckIn || !this.newCheckOut) {
      this.notificationService.warning(this.t('toast.completeBooking'));
      return;
    }
    if (this.newCheckOut <= this.newCheckIn) {
      this.notificationService.warning(this.t('toast.checkoutAfterCheckin'));
      return;
    }

    const payload: CreateReservationRequest = {
      roomId: Number(this.newRoomId),
      guestName: this.newGuestName.trim(),
      guestPhone: this.newGuestPhone.trim(),
      guestEmail: this.newGuestEmail.trim() || null,
      guestIdNumber: this.newGuestIdNumber.trim() || null,
      checkInDate: this.newCheckIn,
      checkOutDate: this.newCheckOut,
      notes: this.newNotes.trim() || null,
    };

    this.submitting.set(true);
    this.reservationService.createReservation(payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.closeCreateModal();
        this.loadReservations();
        this.openDetail(res);
      },
      error: (err) => {
        this.submitting.set(false);
        this.notificationService.error(this.errorMessage(err));
      },
    });
  }

  openDetail(r: Reservation): void {
    this.pendingAction.set(null);
    this.detail.set(null);
    this.isDetailOpen = true;
    this.refreshDetail(r.id);
  }

  closeDetail(): void {
    this.pendingAction.set(null);
    this.isDetailOpen = false;
    this.detail.set(null);
  }

  private refreshDetail(id: number): void {
    this.reservationService.getReservationById(id).subscribe({
      next: (d) => this.setDetail(d),
      error: () => this.notificationService.error(this.t('toast.loadFailed')),
    });
  }

  private setDetail(d: ReservationDetail): void {
    this.detail.set(d);
    this.paymentAmount = d.balance > 0 ? d.balance : '';
    this.paymentMethod = 'Cash';
    this.paymentReference = '';
  }

  askAction(action: StayAction): void {
    this.pendingAction.set(action);
  }

  cancelAction(): void {
    this.pendingAction.set(null);
  }

  runAction(): void {
    const d = this.detail();
    const action = this.pendingAction();
    if (!d || !action) return;

    const call = {
      checkIn: () => this.reservationService.checkIn(d.id),
      checkOut: () => this.reservationService.checkOut(d.id),
      noShow: () => this.reservationService.markNoShow(d.id),
      cancel: () => this.reservationService.cancelReservation(d.id),
    }[action];

    this.working.set(true);
    call().subscribe({
      next: (updated) => {
        this.working.set(false);
        this.pendingAction.set(null);
        this.setDetail(updated);
        this.loadReservations();
      },
      error: (err) => {
        this.working.set(false);
        this.pendingAction.set(null);
        this.notificationService.error(this.errorMessage(err));
      },
    });
  }

  recordPayment(): void {
    const d = this.detail();
    const amount = Number(this.paymentAmount);
    if (!d || !amount || amount <= 0) {
      this.notificationService.warning(this.t('toast.enterAmount'));
      return;
    }

    this.working.set(true);
    this.reservationService
      .recordPayment(d.id, { amount, method: this.paymentMethod, reference: this.paymentReference.trim() || null })
      .subscribe({
        next: (updated) => {
          this.working.set(false);
          this.setDetail(updated);
          this.loadReservations();
        },
        error: (err) => {
          this.working.set(false);
          this.notificationService.error(this.errorMessage(err));
        },
      });
  }

  methodKey(method: PaymentMethod): string {
    return method === 'BankTransfer' ? 'payments.bankTransfer' : method === 'Card' ? 'payments.card' : 'payments.cash';
  }

  private t(key: string, params?: Record<string, string | number>): string {
    return this.translationService.translate(key, params);
  }

  private errorMessage(err: any): string {
    const errors = err?.error?.errors;
    if (errors) {
      const first = Object.values(errors).flat()[0];
      if (typeof first === 'string') return first;
    }
    return err?.error?.detail || this.t('toast.genericError');
  }
}
