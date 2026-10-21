import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AvailableRoomsFilter, IRoomRepository } from '../../../application/common/interfaces/repositories/room.repository';
import { Reservation } from '../../../domain/entities/reservation';
import { Room } from '../../../domain/entities/room';
import { ReservationStatus } from '../../../domain/enums/reservation-status';
import { UnitOfWork } from './unit-of-work';

@Injectable()
export class RoomRepository implements IRoomRepository {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  private get rooms(): Repository<Room> {
    return this.unitOfWork.manager.getRepository(Room);
  }

  getById(id: number): Promise<Room | null> {
    return this.rooms.findOneBy({ id });
  }

  getByIdForUpdate(id: number): Promise<Room | null> {
    const query = this.rooms.createQueryBuilder('room').where('room.id = :id', { id });
    if (this.unitOfWork.isInTransaction && this.unitOfWork.supportsRowLocks) {
      query.setLock('pessimistic_write');
    }
    return query.getOne();
  }

  getByIdWithReservations(id: number): Promise<Room | null> {
    return this.rooms.findOne({ where: { id }, relations: { reservations: true } });
  }

  async existsByRoomNumber(roomNumber: string, excludeRoomId?: number): Promise<boolean> {
    const query = this.rooms
      .createQueryBuilder('room')
      .where('LOWER(room.roomNumber) = :roomNumber', { roomNumber: roomNumber.trim().toLowerCase() });
    if (excludeRoomId !== undefined) {
      query.andWhere('room.id <> :excludeRoomId', { excludeRoomId });
    }
    return (await query.getCount()) > 0;
  }

  getAll(): Promise<Room[]> {
    return this.rooms.find({ order: { roomNumber: 'ASC' } });
  }

  getAvailableRooms(filter: AvailableRoomsFilter): Promise<Room[]> {
    const query = this.rooms.createQueryBuilder('room');

    if (filter.roomType?.trim()) {
      query.andWhere('LOWER(room.roomType) = :roomType', { roomType: filter.roomType.trim().toLowerCase() });
    }
    if (filter.minPrice !== undefined) {
      query.andWhere('room.pricePerNight >= :minPrice', { minPrice: filter.minPrice });
    }
    if (filter.maxPrice !== undefined) {
      query.andWhere('room.pricePerNight <= :maxPrice', { maxPrice: filter.maxPrice });
    }

    if (filter.checkIn && filter.checkOut) {
      const overlapping = query
        .subQuery()
        .select('1')
        .from(Reservation, 'res')
        .where('res.roomId = room.id')
        .andWhere('res.status <> :cancelled')
        .andWhere('res.checkInDate < :checkOut')
        .andWhere('res.checkOutDate > :checkIn')
        .getQuery();
      query.andWhere(`NOT EXISTS ${overlapping}`, {
        cancelled: ReservationStatus.Cancelled,
        checkIn: filter.checkIn,
        checkOut: filter.checkOut,
      });
    } else {
      query.andWhere('room.isAvailable = :isAvailable', { isAvailable: true });
    }

    return query.orderBy('room.roomNumber', 'ASC').getMany();
  }

  add(room: Room): Promise<Room> {
    return this.rooms.save(room);
  }

  update(room: Room): Promise<Room> {
    return this.rooms.save(room);
  }

  async delete(room: Room): Promise<void> {
    await this.rooms.delete({ id: room.id });
  }

  count(onlyAvailable = false): Promise<number> {
    return onlyAvailable ? this.rooms.countBy({ isAvailable: true }) : this.rooms.count();
  }
}
