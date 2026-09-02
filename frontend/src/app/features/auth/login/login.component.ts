import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { UiButtonComponent, UiCardComponent, UiInputComponent } from '../../../shared/components/ui';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslatePipe,
    UiButtonComponent,
    UiCardComponent,
    UiInputComponent,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private signalRService = inject(SignalRService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  translationService = inject(TranslationService);

  email = '';
  password = '';
  loading = signal(false);

  fillAdminDemo(): void {
    this.email = 'admin@hotel.local';
    this.password = 'Admin123!';
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.notificationService.warning('Please enter both email and password');
      return;
    }

    this.loading.set(true);
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.notificationService.success('Logged in successfully');
        this.signalRService.startConnection();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.notificationService.error(err.error?.detail || 'Invalid email or password');
      },
    });
  }
}
