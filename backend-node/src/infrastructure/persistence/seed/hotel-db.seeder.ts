import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { IPasswordHasherService } from '../../../application/common/interfaces/password-hasher.service';
import { AuditLog } from '../../../domain/entities/audit-log';
import { Reservation } from '../../../domain/entities/reservation';
import { Room } from '../../../domain/entities/room';
import { User } from '../../../domain/entities/user';
import { ReservationStatus } from '../../../domain/enums/reservation-status';

const daysAgo = (days: number): Date => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

@Injectable()
export class HotelDbSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(HotelDbSeeder.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly passwordHasher: IPasswordHasherService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.dataSource.transaction((context) => this.seed(context));
      this.logger.log('Database initialized and verified successfully.');
    } catch (error) {
      this.logger.warn(`Database seed skipped or failed: ${(error as Error).message}`);
    }
  }

  private async seed(context: EntityManager): Promise<void> {
    const users = context.getRepository(User);
    const rooms = context.getRepository(Room);
    const reservations = context.getRepository(Reservation);
    const auditLogs = context.getRepository(AuditLog);

    if ((await users.count()) === 0) {
      this.logger.log('Seeding default users...');
      await users.save([
        users.create({
          fullName: 'Hotel Administrator',
          email: 'admin@hotel.local',
          passwordHash: await this.passwordHasher.hashPassword('Admin123!'),
          isActive: true,
          createdAt: new Date(),
        }),
        users.create({
          fullName: 'Front Desk Staff',
          email: 'staff@hotel.local',
          passwordHash: await this.passwordHasher.hashPassword('Staff123!'),
          isActive: true,
          createdAt: new Date(),
        }),
      ]);
    }

    if ((await rooms.count()) === 0) {
      this.logger.log('Seeding default rooms...');
      const seedRooms: Array<[string, string, number]> = [
        ['101', 'Single', 80],
        ['102', 'Single', 85],
        ['201', 'Double', 120],
        ['202', 'Double', 130],
        ['301', 'Suite', 220],
        ['302', 'Suite', 250],
        ['401', 'Deluxe', 350],
      ];
      await rooms.save(
        seedRooms.map(([roomNumber, roomType, pricePerNight]) =>
          rooms.create({ roomNumber, roomType, pricePerNight, isAvailable: true, createdAt: new Date() }),
        ),
      );
    }

    if ((await reservations.count()) === 0) {
      this.logger.log('Seeding default reservations...');
      const admin = await users.findOne({ where: {}, order: { id: 'ASC' } });
      if (!admin) return;
      const roomIds = new Map((await rooms.find()).map((room) => [room.roomNumber, room.id]));

      const seedReservations: Array<[string, string, string, string, number, ReservationStatus, number]> = [
        ['101', 'John Smith', '2026-08-01', '2026-08-05', 4 * 80, ReservationStatus.Confirmed, 30],
        ['101', 'Emily Davis', '2026-08-10', '2026-08-14', 4 * 80, ReservationStatus.Confirmed, 20],
        ['201', 'Michael Brown', '2026-08-03', '2026-08-08', 5 * 120, ReservationStatus.Confirmed, 25],
        ['201', 'Sarah Wilson', '2026-08-15', '2026-08-20', 5 * 120, ReservationStatus.Confirmed, 15],
        ['301', 'Robert Taylor', '2026-08-05', '2026-08-12', 7 * 220, ReservationStatus.Confirmed, 28],
        ['302', 'Jessica Martinez', '2026-08-07', '2026-08-11', 4 * 250, ReservationStatus.Cancelled, 18],
        ['202', 'David Anderson', '2026-09-01', '2026-09-06', 5 * 130, ReservationStatus.Confirmed, 5],
      ];

      await reservations.save(
        seedReservations
          .filter(([roomNumber]) => roomIds.has(roomNumber))
          .map(([roomNumber, guestName, checkInDate, checkOutDate, totalAmount, status, createdDaysAgo]) =>
            reservations.create({
              roomId: roomIds.get(roomNumber)!,
              guestName,
              checkInDate,
              checkOutDate,
              totalAmount,
              status,
              createdBy: admin.id,
              createdAt: daysAgo(createdDaysAgo),
            }),
          ),
      );

      await auditLogs.save(
        auditLogs.create({
          action: 'Created',
          entityName: 'System',
          entityId: 'Init',
          userId: admin.id,
          actionDate: daysAgo(30),
          details: 'System initialized and default database seeded.',
        }),
      );
    }
  }
}
