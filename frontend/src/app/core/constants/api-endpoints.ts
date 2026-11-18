import { environment } from '../../../environments/environment';

export const API_ENDPOINTS = {
  auth: {
    login: `${environment.apiUrl}/auth/login`,
  },
  settings: `${environment.apiUrl}/settings`,
  rooms: {
    base: `${environment.apiUrl}/rooms`,
    byId: (id: number) => `${environment.apiUrl}/rooms/${id}`,
    available: `${environment.apiUrl}/rooms/available`,
  },
  reservations: {
    base: `${environment.apiUrl}/reservations`,
    byId: (id: number) => `${environment.apiUrl}/reservations/${id}`,
    cancel: (id: number) => `${environment.apiUrl}/reservations/${id}/cancel`,
    checkIn: (id: number) => `${environment.apiUrl}/reservations/${id}/check-in`,
    checkOut: (id: number) => `${environment.apiUrl}/reservations/${id}/check-out`,
    noShow: (id: number) => `${environment.apiUrl}/reservations/${id}/no-show`,
    payments: (id: number) => `${environment.apiUrl}/reservations/${id}/payments`,
  },
  guests: {
    base: `${environment.apiUrl}/guests`,
    lookup: `${environment.apiUrl}/guests/lookup`,
  },
  users: {
    base: `${environment.apiUrl}/users`,
    status: (id: number) => `${environment.apiUrl}/users/${id}/status`,
  },
  reports: {
    dashboard: `${environment.apiUrl}/reports/dashboard`,
    topRooms: (take = 5) => `${environment.apiUrl}/reports/top-rooms?take=${take}`,
    revenue: `${environment.apiUrl}/reports/revenue`,
    occupancy: `${environment.apiUrl}/reports/occupancy`,
  },
  auditLogs: {
    base: (take = 100) => `${environment.apiUrl}/audit-logs?take=${take}`,
  },
  hubs: {
    reservations: environment.hubUrl,
  },
} as const;
