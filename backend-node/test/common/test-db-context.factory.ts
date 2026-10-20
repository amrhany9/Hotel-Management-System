import { DataSource } from 'typeorm';
import type { ICurrentUserService } from '../../src/application/common/interfaces/current-user.service';
import type { ISignalRNotificationService } from '../../src/application/common/interfaces/signalr-notification.service';
import { AuditLog } from '../../src/domain/entities/audit-log';
import { Reservation } from '../../src/domain/entities/reservation';
import { Room } from '../../src/domain/entities/room';
import { User } from '../../src/domain/entities/user';
import { ReservationStatus } from '../../src/domain/enums/reservation-status';
import { ENTITY_CONFIGURATIONS } from '../../src/infrastructure/persistence/configurations';
import { AuditLogRepository } from '../../src/infrastructure/persistence/repositories/audit-log.repository';
import { ReportRepository } from '../../src/infrastructure/persistence/repositories/report.repository';
import { ReservationRepository } from '../../src/infrastructure/persistence/repositories/reservation.repository';
import { RoomRepository } from '../../src/infrastructure/persistence/repositories/room.repository';
import { UnitOfWork } from '../../src/infrastructure/persistence/repositories/unit-of-work';
import { UserRepository } from '../../src/infrastructure/persistence/repositories/user.repository';

export type SignalRMock = jest.Mocked<ISignalRNotificationService>;

export interface TestDbContext {
  dataSource: DataSource;
  unitOfWork: UnitOfWork;
  users: UserRepository;
  rooms: RoomRepository;
  reservations: ReservationRepository;
  auditLogs: AuditLogRepository;
  reports: ReportRepository;
  addUser(values?: Partial<User>): Promise<User>;
  addRoom(values?: Partial<Room>): Promise<Room>;
  addReservation(values: Partial<Reservation> & { roomId: number; createdBy: number }): Promise<Reservation>;
  count(entity: typeof User | typeof Room | typeof Reservation | typeof AuditLog): Promise<number>;
  dispose(): Promise<void>;
}

export async function createTestDbContext(): Promise<TestDbContext> {
  const dataSource = new DataSource({ type: 'sqljs', entities: ENTITY_CONFIGURATIONS, synchronize: true, logging: false });
  await dataSource.initialize();
  const unitOfWork = new UnitOfWork(dataSource);

  return {
    dataSource,
    unitOfWork,
    users: new UserRepository(unitOfWork),
    rooms: new RoomRepository(unitOfWork),
    reservations: new ReservationRepository(unitOfWork),
    auditLogs: new AuditLogRepository(unitOfWork),
    reports: new ReportRepository(unitOfWork),
    addUser: (values = {}) =>
      dataSource.getRepository(User).save(
        Object.assign(new User(), { fullName: 'Admin User', email: 'admin@hotel.local', passwordHash: 'hash', ...values }),
      ),
    addRoom: (values = {}) =>
      dataSource.getRepository(Room).save(
        Object.assign(new Room(), { roomNumber: '101', roomType: 'Single', pricePerNight: 100, isAvailable: true, ...values }),
      ),
    addReservation: (values) =>
      dataSource.getRepository(Reservation).save(
        Object.assign(new Reservation(), {
          guestName: 'Guest',
          checkInDate: '2026-09-01',
          checkOutDate: '2026-09-05',
          totalAmount: 400,
          status: ReservationStatus.Confirmed,
          ...values,
        }),
      ),
    count: (entity) => dataSource.getRepository(entity).count(),
    dispose: () => dataSource.destroy(),
  };
}

export function mockCurrentUser(userId: number | undefined = 1): ICurrentUserService {
  return {
    userId,
    email: 'admin@hotel.local',
    fullName: 'Admin User',
    isAuthenticated: userId !== undefined,
  };
}

export function mockSignalR(): SignalRMock {
  return {
    notifyReservationCreated: jest.fn().mockResolvedValue(undefined),
    notifyReservationCancelled: jest.fn().mockResolvedValue(undefined),
    notifyRoomCreated: jest.fn().mockResolvedValue(undefined),
    notifyRoomUpdated: jest.fn().mockResolvedValue(undefined),
    notifyRoomDeleted: jest.fn().mockResolvedValue(undefined),
  };
}
