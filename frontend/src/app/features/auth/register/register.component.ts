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
  selector: 'app-register',
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
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private signalRService = inject(SignalRService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  fullName = '';
  email = '';
  password = '';
  loading = signal(false);

  onSubmit(): void {
    if (!this.fullName || !this.email || !this.password) {
      this.notificationService.warning('Please fill in all required fields');
      return;
    }

    this.loading.set(true);
    this.authService
      .register({
        fullName: this.fullName,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.notificationService.success('Account created successfully');
          this.signalRService.startConnection();
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.loading.set(false);
          this.notificationService.error(err.error?.detail || 'Registration failed');
        },
      });
  }
}
