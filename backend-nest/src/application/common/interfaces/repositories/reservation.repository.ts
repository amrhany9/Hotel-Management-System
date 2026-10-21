import type { DateOnly } from '../../../../domain/common/date-only';
import type { Reservation } from '../../../../domain/entities/reservation';
import type { ReservationStatus } from '../../../../domain/enums/reservation-status';

export interface ReservationSearchFilter {
  guestName?: string;
  roomNumber?: string;
  checkInDate?: DateOnly;
  checkOutDate?: DateOnly;
  status?: ReservationStatus;
}

export abstract class IReservationRepository {
  abstract getById(id: number): Promise<Reservation | null>;
  abstract search(filter: ReservationSearchFilter): Promise<Reservation[]>;
  abstract hasOverlap(roomId: number, checkIn: DateOnly, checkOut: DateOnly, excludeReservationId?: number): Promise<boolean>;
  abstract add(reservation: Reservation): Promise<Reservation>;
  abstract update(reservation: Reservation): Promise<Reservation>;
  abstract removeRange(reservations: Reservation[]): Promise<void>;
  abstract count(status?: ReservationStatus): Promise<number>;
}
