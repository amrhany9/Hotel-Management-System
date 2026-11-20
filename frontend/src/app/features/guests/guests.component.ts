import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GuestService } from '../../core/services/guest.service';
import { NotificationService } from '../../core/services/notification.service';
import { TranslationService } from '../../core/services/translation.service';
import { Guest } from '../../core/models/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { DisplayDatePipe } from '../../shared/pipes/display-date.pipe';
import { UiCardComponent, UiInputComponent } from '../../shared/components/ui';

@Component({
  selector: 'app-guests',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MoneyPipe, DisplayDatePipe, UiCardComponent, UiInputComponent],
  templateUrl: './guests.component.html',
})
export class GuestsComponent implements OnInit {
  private guestService = inject(GuestService);
  private notificationService = inject(NotificationService);
  private translation = inject(TranslationService);

  guests = signal<Guest[]>([]);
  loading = signal(true);
  search = '';

  private search$ = new Subject<string>();

  constructor() {
    this.search$
      .pipe(
        debounceTime(250),
        switchMap((term) => this.guestService.getGuests(term)),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (list) => {
          this.guests.set(list);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notificationService.error(this.translation.translate('toast.loadFailed'));
        },
      });
  }

  ngOnInit(): void {
    this.search$.next('');
  }

  onSearch(term: string): void {
    this.search$.next(term);
  }
}
