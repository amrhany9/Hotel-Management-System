import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { TranslationService } from '../../core/services/translation.service';
import { StaffUser, UserRole } from '../../core/models/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import {
  ComboboxOption,
  UiBadgeComponent,
  UiButtonComponent,
  UiCardComponent,
  UiComboboxComponent,
  UiInputComponent,
  UiModalComponent,
} from '../../shared/components/ui';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe,
    UiBadgeComponent,
    UiButtonComponent,
    UiCardComponent,
    UiComboboxComponent,
    UiInputComponent,
    UiModalComponent,
  ],
  templateUrl: './staff.component.html',
})
export class StaffComponent implements OnInit {
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private translationService = inject(TranslationService);
  authService = inject(AuthService);

  users = signal<StaffUser[]>([]);
  loading = signal(true);
  saving = signal(false);
  togglingId = signal<number | null>(null);

  isModalOpen = false;
  fullName = '';
  email = '';
  password = '';
  role: UserRole = 'FrontDesk';

  roleOptions = computed<ComboboxOption[]>(() => {
    this.translationService.currentLang();
    return [
      { label: this.translationService.translate('staff.frontDesk'), value: 'FrontDesk' },
      { label: this.translationService.translate('staff.admin'), value: 'Admin' },
    ];
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.userService.getUsers().subscribe({
      next: (list) => {
        this.users.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.notificationService.error('Failed to load staff accounts');
      },
    });
  }

  roleKey(role: UserRole): string {
    return role === 'Admin' ? 'staff.admin' : 'staff.frontDesk';
  }

  isSelf(user: StaffUser): boolean {
    return user.id === this.authService.currentUser()?.userId;
  }

  openModal(): void {
    this.fullName = '';
    this.email = '';
    this.password = '';
    this.role = 'FrontDesk';
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  create(): void {
    if (!this.fullName.trim() || !this.email.trim() || !this.password) {
      this.notificationService.warning('Please complete all fields');
      return;
    }
    this.saving.set(true);
    this.userService
      .createUser({ fullName: this.fullName.trim(), email: this.email.trim(), password: this.password, role: this.role })
      .subscribe({
        next: (user) => {
          this.saving.set(false);
          this.closeModal();
          this.notificationService.success(`${user.fullName} can now sign in`);
          this.load();
        },
        error: (err) => {
          this.saving.set(false);
          this.notificationService.error(this.errorMessage(err));
        },
      });
  }

  toggle(user: StaffUser): void {
    this.togglingId.set(user.id);
    this.userService.setActive(user.id, !user.isActive).subscribe({
      next: (updated) => {
        this.togglingId.set(null);
        this.users.update((list) => list.map((u) => (u.id === updated.id ? updated : u)));
      },
      error: (err) => {
        this.togglingId.set(null);
        this.notificationService.error(this.errorMessage(err));
      },
    });
  }

  private errorMessage(err: any): string {
    const errors = err?.error?.errors;
    if (errors) {
      const first = Object.values(errors).flat()[0];
      if (typeof first === 'string') return first;
    }
    return err?.error?.detail || 'Something went wrong';
  }
}
