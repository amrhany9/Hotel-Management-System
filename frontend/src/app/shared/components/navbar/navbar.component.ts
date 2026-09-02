import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { UiButtonComponent } from '../ui';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe, UiButtonComponent],
  templateUrl: './navbar.component.html',
  host: { class: 'block w-full' },
})
export class NavbarComponent {
  authService = inject(AuthService);
  signalRService = inject(SignalRService);
  translationService = inject(TranslationService);

  showMobileMenu = signal(false);

  toggleMobileMenu(): void {
    this.showMobileMenu.update(v => !v);
  }

  closeMobileMenu(): void {
    this.showMobileMenu.set(false);
  }

  logout(): void {
    this.closeMobileMenu();
    this.signalRService.stopConnection();
    this.authService.logout();
  }
}
