import type { DateOnly } from '../../../../domain/common/date-only';
import type { Room } from '../../../../domain/entities/room';

export interface AvailableRoomsFilter {
  roomType?: string;
  minPrice?: number;
  maxPrice?: number;
  checkIn?: DateOnly;
  checkOut?: DateOnly;
}

export abstract class IRoomRepository {
  abstract getById(id: number): Promise<Room | null>;
  abstract getByIdForUpdate(id: number): Promise<Room | null>;
  abstract getByIdWithReservations(id: number): Promise<Room | null>;
  abstract existsByRoomNumber(roomNumber: string, excludeRoomId?: number): Promise<boolean>;
  abstract getAll(): Promise<Room[]>;
  abstract getAvailableRooms(filter: AvailableRoomsFilter): Promise<Room[]>;
  abstract add(room: Room): Promise<Room>;
  abstract update(room: Room): Promise<Room>;
  abstract delete(room: Room): Promise<void>;
  abstract count(onlyAvailable?: boolean): Promise<number>;
}
