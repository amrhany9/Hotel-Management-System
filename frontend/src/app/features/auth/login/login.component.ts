import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { SettingsService } from '../../../core/services/settings.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { UiButtonComponent, UiCardComponent, UiInputComponent } from '../../../shared/components/ui';
import { environment } from '../../../../environments/environment';

interface DemoAccount {
  email: string;
  password: string;
  roleKey: string;
  descKey: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, UiButtonComponent, UiCardComponent, UiInputComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private signalRService = inject(SignalRService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private settingsService = inject(SettingsService);
  translationService = inject(TranslationService);

  email = '';
  password = '';
  loading = signal(false);

  showDemoAccounts = computed(() => this.settingsService.settings().demoMode || !environment.production);
  hotelName = computed(() => this.settingsService.settings().hotelName);

  readonly demoAccounts: DemoAccount[] = [
    { email: 'admin@hotel.local', password: 'Admin123!', roleKey: 'staff.admin', descKey: 'demo.adminDesc' },
    { email: 'staff@hotel.local', password: 'Staff123!', roleKey: 'staff.frontDesk', descKey: 'demo.frontDeskDesc' },
  ];

  signInAs(account: DemoAccount): void {
    this.email = account.email;
    this.password = account.password;
    this.onSubmit();
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.notificationService.warning('Please enter both email and password');
      return;
    }

    this.loading.set(true);
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.notificationService.success(`Welcome, ${res.fullName}`);
        this.signalRService.startConnection();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        const message = err.error?.errors ? Object.values(err.error.errors).flat()[0] : err.error?.detail;
        this.notificationService.error((message as string) || 'Invalid email or password');
      },
    });
  }
}
