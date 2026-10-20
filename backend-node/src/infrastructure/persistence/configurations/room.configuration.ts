import { EntitySchema } from 'typeorm';
import { Room } from '../../../domain/entities/room';
import { decimalTransformer } from './value-transformers';

export const RoomConfiguration = new EntitySchema<Room>({
  name: 'Room',
  target: Room,
  tableName: 'Rooms',
  columns: {
    id: { name: 'Id', type: 'int', primary: true, generated: 'increment' },
    roomNumber: { name: 'RoomNumber', type: 'nvarchar', length: 50 },
    roomType: { name: 'RoomType', type: 'nvarchar', length: 50 },
    pricePerNight: { name: 'PricePerNight', type: 'decimal', precision: 18, scale: 2, transformer: decimalTransformer },
    isAvailable: { name: 'IsAvailable', type: Boolean, default: true },
    createdAt: { name: 'CreatedAt', type: 'datetime' },
  },
  indices: [{ name: 'IX_Rooms_RoomNumber', columns: ['roomNumber'], unique: true }],
  relations: {
    reservations: { type: 'one-to-many', target: 'Reservation', inverseSide: 'room' },
  },
});
