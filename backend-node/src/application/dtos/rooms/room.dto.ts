import type { Room } from '../../../domain/entities/room';

export class RoomDto {
  id: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  isAvailable: boolean;
  createdAt: Date;

  static from(room: Room): RoomDto {
    return {
      id: room.id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      isAvailable: room.isAvailable,
      createdAt: room.createdAt,
    };
  }
}
