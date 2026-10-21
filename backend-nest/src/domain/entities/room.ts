import type { Reservation } from './reservation';

export class Room {
  id: number;
  roomNumber = '';
  roomType = '';
  pricePerNight = 0;
  isAvailable = true;
  createdAt: Date = new Date();

  reservations?: Reservation[];
}
