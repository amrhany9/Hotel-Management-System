import { BadgeVariant } from './components/ui';
import { ReservationStatus } from '../core/models/reservation.models';

export const RESERVATION_STATUSES: ReservationStatus[] = ['Confirmed', 'CheckedIn', 'CheckedOut', 'NoShow', 'Cancelled'];

const STATUS_META: Record<ReservationStatus, { key: string; variant: BadgeVariant }> = {
  Confirmed: { key: 'stay.confirmed', variant: 'info' },
  CheckedIn: { key: 'stay.checkedIn', variant: 'success' },
  CheckedOut: { key: 'stay.checkedOut', variant: 'neutral' },
  NoShow: { key: 'stay.noShow', variant: 'warning' },
  Cancelled: { key: 'stay.cancelled', variant: 'danger' },
};

export function statusKey(status: ReservationStatus): string {
  return STATUS_META[status]?.key ?? status;
}

export function statusVariant(status: ReservationStatus): BadgeVariant {
  return STATUS_META[status]?.variant ?? 'neutral';
}

export function todayIso(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}
