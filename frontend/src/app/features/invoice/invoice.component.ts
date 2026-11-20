import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../core/services/reservation.service';
import { SettingsService } from '../../core/services/settings.service';
import { TranslationService } from '../../core/services/translation.service';
import { PaymentMethod, ReservationDetail } from '../../core/models/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { DisplayDatePipe } from '../../shared/pipes/display-date.pipe';
import { statusKey } from '../../shared/reservation-status';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, MoneyPipe, DisplayDatePipe],
  templateUrl: './invoice.component.html',
})
export class InvoiceComponent implements OnInit {
  readonly id = input.required<string>();

  private reservationService = inject(ReservationService);
  private translationService = inject(TranslationService);
  settings = inject(SettingsService).settings;

  reservation = signal<ReservationDetail | null>(null);
  error = signal(false);
  readonly issuedOn = new Date();
  readonly statusKey = statusKey;

  isFinal = computed(() => this.reservation()?.status === 'CheckedOut');

  lineDescription = computed(() => {
    const r = this.reservation();
    if (!r) return '';
    this.translationService.currentLang();
    return this.translationService
      .translate('invoice.roomNights')
      .replace('{room}', r.roomNumber)
      .replace('{type}', r.roomType);
  });

  ngOnInit(): void {
    this.reservationService.getReservationById(Number(this.id())).subscribe({
      next: (r) => this.reservation.set(r),
      error: () => this.error.set(true),
    });
  }

  methodKey(method: PaymentMethod): string {
    return method === 'BankTransfer' ? 'payments.bankTransfer' : method === 'Card' ? 'payments.card' : 'payments.cash';
  }

  print(): void {
    window.print();
  }
}
