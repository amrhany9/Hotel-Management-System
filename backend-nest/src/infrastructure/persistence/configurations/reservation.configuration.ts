import { EntitySchema } from 'typeorm';
import { Reservation } from '../../../domain/entities/reservation';
import { dateOnlyTransformer, decimalTransformer } from './value-transformers';

export const ReservationConfiguration = new EntitySchema<Reservation>({
  name: 'Reservation',
  target: Reservation,
  tableName: 'Reservations',
  columns: {
    id: { name: 'Id', type: 'int', primary: true, generated: 'increment' },
    roomId: { name: 'RoomId', type: 'int' },
    guestName: { name: 'GuestName', type: 'nvarchar', length: 100 },
    checkInDate: { name: 'CheckInDate', type: 'varchar', length: 10, transformer: dateOnlyTransformer },
    checkOutDate: { name: 'CheckOutDate', type: 'varchar', length: 10, transformer: dateOnlyTransformer },
    totalAmount: { name: 'TotalAmount', type: 'decimal', precision: 18, scale: 2, transformer: decimalTransformer },
    status: { name: 'Status', type: 'nvarchar', length: 20 },
    createdBy: { name: 'CreatedBy', type: 'int' },
    createdAt: { name: 'CreatedAt', type: 'datetime' },
  },
  indices: [
    { name: 'IX_Reservations_RoomId', columns: ['roomId'] },
    { name: 'IX_Reservations_CreatedBy', columns: ['createdBy'] },
  ],
  relations: {
    room: {
      type: 'many-to-one',
      target: 'Room',
      inverseSide: 'reservations',
      joinColumn: { name: 'RoomId', foreignKeyConstraintName: 'FK_Reservations_Rooms_RoomId' },
      onDelete: 'NO ACTION',
    },
    user: {
      type: 'many-to-one',
      target: 'User',
      inverseSide: 'reservations',
      joinColumn: { name: 'CreatedBy', foreignKeyConstraintName: 'FK_Reservations_Users_CreatedBy' },
      onDelete: 'NO ACTION',
    },
  },
});
