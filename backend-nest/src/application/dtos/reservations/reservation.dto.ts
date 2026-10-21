import { daysBetween, type DateOnly } from '../../../domain/common/date-only';
import type { Reservation } from '../../../domain/entities/reservation';

export class ReservationDto {
  id: number;
  roomId: number;
  roomNumber: string;
  roomType: string;
  guestName: string;
  checkInDate: DateOnly;
  checkOutDate: DateOnly;
  nights: number;
  totalAmount: number;
  status: string;
  createdBy: number;
  createdByName: string;
  createdAt: Date;

  static from(reservation: Reservation): ReservationDto {
    return {
      id: reservation.id,
      roomId: reservation.roomId,
      roomNumber: reservation.room?.roomNumber ?? '',
      roomType: reservation.room?.roomType ?? '',
      guestName: reservation.guestName,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      nights: daysBetween(reservation.checkInDate, reservation.checkOutDate),
      totalAmount: reservation.totalAmount,
      status: reservation.status,
      createdBy: reservation.createdBy,
      createdByName: reservation.user?.fullName ?? `User #${reservation.createdBy}`,
      createdAt: reservation.createdAt,
    };
  }
}
