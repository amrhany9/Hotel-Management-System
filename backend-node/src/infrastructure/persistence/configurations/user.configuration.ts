import { EntitySchema } from 'typeorm';
import { User } from '../../../domain/entities/user';

export const UserConfiguration = new EntitySchema<User>({
  name: 'User',
  target: User,
  tableName: 'Users',
  columns: {
    id: { name: 'Id', type: 'int', primary: true, generated: 'increment' },
    fullName: { name: 'FullName', type: 'nvarchar', length: 100 },
    email: { name: 'Email', type: 'nvarchar', length: 150 },
    passwordHash: { name: 'PasswordHash', type: 'text' },
    isActive: { name: 'IsActive', type: Boolean, default: true },
    createdAt: { name: 'CreatedAt', type: 'datetime' },
  },
  indices: [{ name: 'IX_Users_Email', columns: ['email'], unique: true }],
  relations: {
    reservations: { type: 'one-to-many', target: 'Reservation', inverseSide: 'user' },
    auditLogs: { type: 'one-to-many', target: 'AuditLog', inverseSide: 'user' },
  },
});
