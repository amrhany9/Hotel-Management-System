export enum ReservationStatus {
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled',
}

export function parseReservationStatus(value: string | undefined | null): ReservationStatus | undefined {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'confirmed' || normalized === '1') return ReservationStatus.Confirmed;
  if (normalized === 'cancelled' || normalized === '2') return ReservationStatus.Cancelled;
  return undefined;
}
