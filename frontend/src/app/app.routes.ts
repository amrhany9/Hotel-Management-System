import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'rooms',
    canActivate: [authGuard],
    loadComponent: () => import('./features/rooms/rooms.component').then((m) => m.RoomsComponent),
  },
  {
    path: 'reservations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reservations/reservations.component').then((m) => m.ReservationsComponent),
  },
  {
    path: 'reservations/:id/invoice',
    canActivate: [authGuard],
    loadComponent: () => import('./features/invoice/invoice.component').then((m) => m.InvoiceComponent),
  },
  {
    path: 'guests',
    canActivate: [authGuard],
    loadComponent: () => import('./features/guests/guests.component').then((m) => m.GuestsComponent),
  },
  {
    path: 'staff',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/staff/staff.component').then((m) => m.StaffComponent),
  },
  {
    path: 'audit-logs',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/audit-logs/audit-logs.component').then((m) => m.AuditLogsComponent),
  },
  {
    path: 'reports',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/reports/reports.component').then((m) => m.ReportsComponent),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
