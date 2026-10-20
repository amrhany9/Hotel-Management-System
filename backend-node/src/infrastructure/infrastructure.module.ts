import { Global, Module, Provider } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ICurrentUserService } from '../application/common/interfaces/current-user.service';
import { IJwtTokenGenerator } from '../application/common/interfaces/jwt-token-generator';
import { IPasswordHasherService } from '../application/common/interfaces/password-hasher.service';
import { IAuditLogRepository } from '../application/common/interfaces/repositories/audit-log.repository';
import { IReportRepository } from '../application/common/interfaces/repositories/report.repository';
import { IReservationRepository } from '../application/common/interfaces/repositories/reservation.repository';
import { IRoomRepository } from '../application/common/interfaces/repositories/room.repository';
import { IUnitOfWork } from '../application/common/interfaces/repositories/unit-of-work';
import { IUserRepository } from '../application/common/interfaces/repositories/user.repository';
import { APP_CONFIG, AppConfig } from '../config/app.config';
import { JwtTokenGenerator } from './authentication/jwt-token-generator';
import { JwtTokenValidator } from './authentication/jwt-token-validator';
import { PasswordHasherService } from './authentication/password-hasher.service';
import { AuditLogRepository } from './persistence/repositories/audit-log.repository';
import { ReportRepository } from './persistence/repositories/report.repository';
import { ReservationRepository } from './persistence/repositories/reservation.repository';
import { RoomRepository } from './persistence/repositories/room.repository';
import { UnitOfWork } from './persistence/repositories/unit-of-work';
import { UserRepository } from './persistence/repositories/user.repository';
import { HotelDbSeeder } from './persistence/seed/hotel-db.seeder';
import { createTypeOrmOptions } from './persistence/typeorm-options.factory';
import { CurrentUserService } from './services/current-user.service';
import { RequestContext } from './services/request-context';

const INFRASTRUCTURE_SERVICES: Provider[] = [
  UnitOfWork,
  { provide: IUnitOfWork, useExisting: UnitOfWork },
  { provide: IUserRepository, useClass: UserRepository },
  { provide: IRoomRepository, useClass: RoomRepository },
  { provide: IReservationRepository, useClass: ReservationRepository },
  { provide: IAuditLogRepository, useClass: AuditLogRepository },
  { provide: IReportRepository, useClass: ReportRepository },

  RequestContext,
  { provide: ICurrentUserService, useClass: CurrentUserService },
  { provide: IPasswordHasherService, useClass: PasswordHasherService },
  { provide: IJwtTokenGenerator, useClass: JwtTokenGenerator },
  JwtTokenValidator,
];

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [APP_CONFIG],
      useFactory: (config: AppConfig) => createTypeOrmOptions(config),
    }),
    JwtModule.register({}),
  ],
  providers: [...INFRASTRUCTURE_SERVICES, HotelDbSeeder],
  exports: [
    IUnitOfWork,
    IUserRepository,
    IRoomRepository,
    IReservationRepository,
    IAuditLogRepository,
    IReportRepository,
    ICurrentUserService,
    IPasswordHasherService,
    IJwtTokenGenerator,
    JwtTokenValidator,
    RequestContext,
  ],
})
export class InfrastructureModule {}
