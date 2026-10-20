import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ApplicationModule } from '../application/application.module';
import { AuditLogsController } from './controllers/audit-logs.controller';
import { AuthController } from './controllers/auth.controller';
import { ReportsController } from './controllers/reports.controller';
import { ReservationsController } from './controllers/reservations.controller';
import { RoomsController } from './controllers/rooms.controller';
import { HubsModule } from './hubs/hubs.module';
import { JwtAuthenticationGuard } from './middleware/jwt-authentication.guard';
import { RequestContextInterceptor } from './middleware/request-context.interceptor';

@Module({
  imports: [ApplicationModule, HubsModule],
  controllers: [AuthController, RoomsController, ReservationsController, ReportsController, AuditLogsController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthenticationGuard },
    { provide: APP_INTERCEPTOR, useClass: RequestContextInterceptor },
  ],
})
export class ApiModule {}
