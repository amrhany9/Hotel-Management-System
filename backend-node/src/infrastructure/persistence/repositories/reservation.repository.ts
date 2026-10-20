import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  IReservationRepository,
  ReservationSearchFilter,
} from '../../../application/common/interfaces/repositories/reservation.repository';
import type { DateOnly } from '../../../domain/common/date-only';
import { Reservation } from '../../../domain/entities/reservation';
import { ReservationStatus } from '../../../domain/enums/reservation-status';
import { UnitOfWork } from './unit-of-work';

function likeContains(value: string): string {
  return `%${value.trim().toLowerCase().replace(/[\\%_[]/g, (char) => `\\${char}`)}%`;
}

@Injectable()
export class ReservationRepository implements IReservationRepository {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  private get reservations(): Repository<Reservation> {
    return this.unitOfWork.manager.getRepository(Reservation);
  }

  getById(id: number): Promise<Reservation | null> {
    return this.reservations.findOne({ where: { id }, relations: { room: true, user: true } });
  }

  search(filter: ReservationSearchFilter): Promise<Reservation[]> {
    const query = this.reservations
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.room', 'room')
      .leftJoinAndSelect('r.user', 'user');

    if (filter.guestName?.trim()) {
      query.andWhere(`LOWER(r.guestName) LIKE :guestName ESCAPE '\\'`, { guestName: likeContains(filter.guestName) });
    }
    if (filter.roomNumber?.trim()) {
      query.andWhere(`LOWER(room.roomNumber) LIKE :roomNumber ESCAPE '\\'`, {
        roomNumber: likeContains(filter.roomNumber),
      });
    }
    if (filter.checkInDate) {
      query.andWhere('r.checkInDate >= :checkInDate', { checkInDate: filter.checkInDate });
    }
    if (filter.checkOutDate) {
      query.andWhere('r.checkOutDate <= :checkOutDate', { checkOutDate: filter.checkOutDate });
    }
    if (filter.status) {
      query.andWhere('r.status = :status', { status: filter.status });
    }

    return query.orderBy('r.createdAt', 'DESC').addOrderBy('r.id', 'DESC').getMany();
  }

  async hasOverlap(roomId: number, checkIn: DateOnly, checkOut: DateOnly, excludeReservationId?: number): Promise<boolean> {
    const query = this.reservations
      .createQueryBuilder('r')
      .where('r.roomId = :roomId', { roomId })
      .andWhere('r.status <> :cancelled', { cancelled: ReservationStatus.Cancelled })
      .andWhere('r.checkInDate < :checkOut', { checkOut })
      .andWhere('r.checkOutDate > :checkIn', { checkIn });
    if (excludeReservationId !== undefined) {
      query.andWhere('r.id <> :excludeReservationId', { excludeReservationId });
    }
    return (await query.getCount()) > 0;
  }

  add(reservation: Reservation): Promise<Reservation> {
    return this.reservations.save(reservation);
  }

  update(reservation: Reservation): Promise<Reservation> {
    return this.reservations.save(reservation);
  }

  async removeRange(reservations: Reservation[]): Promise<void> {
    await this.reservations.remove(reservations);
  }

  count(status?: ReservationStatus): Promise<number> {
    return status ? this.reservations.countBy({ status }) : this.reservations.count();
  }
}
