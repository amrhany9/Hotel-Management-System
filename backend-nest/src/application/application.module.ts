import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LoginCommandHandler } from './commands/auth/login.command';
import { RegisterCommandHandler } from './commands/auth/register.command';
import { CancelReservationCommandHandler } from './commands/reservations/cancel-reservation.command';
import { CreateReservationCommandHandler } from './commands/reservations/create-reservation.command';
import { CreateRoomCommandHandler } from './commands/rooms/create-room.command';
import { DeleteRoomCommandHandler } from './commands/rooms/delete-room.command';
import { UpdateRoomCommandHandler } from './commands/rooms/update-room.command';
import { VALIDATORS, ValidationBehavior } from './common/behaviors/validation.behavior';
import { IMediator, Mediator } from './common/mediator/mediator';
import { IPipelineBehavior, PIPELINE_BEHAVIORS } from './common/mediator/pipeline-behavior';
import { GetAuditLogsQueryHandler } from './queries/audit-logs/get-audit-logs.query';
import { GetDashboardStatsQueryHandler } from './queries/reports/get-dashboard-stats.query';
import { GetOccupancyReportQueryHandler } from './queries/reports/get-occupancy-report.query';
import { GetRevenueReportQueryHandler } from './queries/reports/get-revenue-report.query';
import { GetTopRoomsReportQueryHandler } from './queries/reports/get-top-rooms-report.query';
import { GetReservationByIdQueryHandler } from './queries/reservations/get-reservation-by-id.query';
import { GetReservationsQueryHandler } from './queries/reservations/get-reservations.query';
import { GetAvailableRoomsQueryHandler } from './queries/rooms/get-available-rooms.query';
import { GetRoomByIdQueryHandler } from './queries/rooms/get-room-by-id.query';
import { GetRoomsQueryHandler } from './queries/rooms/get-rooms.query';
import { LoginCommandValidator } from './validators/auth/login-command.validator';
import { RegisterCommandValidator } from './validators/auth/register-command.validator';
import { GetOccupancyReportQueryValidator } from './validators/reports/get-occupancy-report-query.validator';
import { GetRevenueReportQueryValidator } from './validators/reports/get-revenue-report-query.validator';
import { CreateReservationCommandValidator } from './validators/reservations/create-reservation-command.validator';
import { CreateRoomCommandValidator } from './validators/rooms/create-room-command.validator';
import { UpdateRoomCommandValidator } from './validators/rooms/update-room-command.validator';

export const COMMAND_HANDLERS = [
  LoginCommandHandler,
  RegisterCommandHandler,
  CreateReservationCommandHandler,
  CancelReservationCommandHandler,
  CreateRoomCommandHandler,
  UpdateRoomCommandHandler,
  DeleteRoomCommandHandler,
];

export const QUERY_HANDLERS = [
  GetAuditLogsQueryHandler,
  GetDashboardStatsQueryHandler,
  GetOccupancyReportQueryHandler,
  GetRevenueReportQueryHandler,
  GetTopRoomsReportQueryHandler,
  GetReservationByIdQueryHandler,
  GetReservationsQueryHandler,
  GetAvailableRoomsQueryHandler,
  GetRoomByIdQueryHandler,
  GetRoomsQueryHandler,
];

export const APPLICATION_VALIDATORS = [
  LoginCommandValidator,
  RegisterCommandValidator,
  GetOccupancyReportQueryValidator,
  GetRevenueReportQueryValidator,
  CreateReservationCommandValidator,
  CreateRoomCommandValidator,
  UpdateRoomCommandValidator,
];

@Module({
  imports: [CqrsModule.forRoot()],
  providers: [
    ...COMMAND_HANDLERS,
    ...QUERY_HANDLERS,
    { provide: VALIDATORS, useValue: APPLICATION_VALIDATORS },
    ValidationBehavior,
    {
      provide: PIPELINE_BEHAVIORS,
      useFactory: (validation: ValidationBehavior): IPipelineBehavior[] => [validation],
      inject: [ValidationBehavior],
    },
    Mediator,
    { provide: IMediator, useExisting: Mediator },
  ],
  exports: [IMediator],
})
export class ApplicationModule {}
