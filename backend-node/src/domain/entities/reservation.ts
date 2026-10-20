import type { DateOnly } from '../common/date-only';
import { ReservationStatus } from '../enums/reservation-status';
import type { Room } from './room';
import type { User } from './user';

export class Reservation {
  id: number;

  roomId: number;
  room?: Room;

  guestName = '';
  checkInDate: DateOnly;
  checkOutDate: DateOnly;
  totalAmount = 0;
  status: ReservationStatus = ReservationStatus.Confirmed;

  createdBy: number;
  user?: User;

  createdAt: Date = new Date();
}
