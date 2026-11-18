import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { TranslationService } from '../../../core/services/translation.service';
import { SettingsService } from '../../../core/services/settings.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { UiButtonComponent } from '../ui';

interface NavLink {
  path: string;
  key: string;
  adminOnly?: boolean;
}

const LINKS: NavLink[] = [
  { path: '/dashboard', key: 'nav.dashboard' },
  { path: '/reservations', key: 'nav.reservations' },
  { path: '/guests', key: 'nav.guests' },
  { path: '/rooms', key: 'nav.rooms' },
  { path: '/reports', key: 'nav.reports', adminOnly: true },
  { path: '/staff', key: 'nav.staff', adminOnly: true },
  { path: '/audit-logs', key: 'nav.auditLogs', adminOnly: true },
];

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslatePipe, UiButtonComponent],
  templateUrl: './navbar.component.html',
  host: { class: 'block w-full print:hidden' },
})
export class NavbarComponent {
  authService = inject(AuthService);
  signalRService = inject(SignalRService);
  translationService = inject(TranslationService);
  settingsService = inject(SettingsService);

  showMobileMenu = signal(false);

  links = computed(() => LINKS.filter((l) => !l.adminOnly || this.authService.isAdmin()));
  roleKey = computed(() => (this.authService.isAdmin() ? 'staff.admin' : 'staff.frontDesk'));

  toggleMobileMenu(): void {
    this.showMobileMenu.update((v) => !v);
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
