import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CancelReservationCommand } from '../../application/commands/reservations/cancel-reservation.command';
import { CreateReservationCommand } from '../../application/commands/reservations/create-reservation.command';
import { IMediator } from '../../application/common/mediator/mediator';
import { ReservationDto } from '../../application/dtos/reservations/reservation.dto';
import { GetReservationByIdQuery } from '../../application/queries/reservations/get-reservation-by-id.query';
import { GetReservationsQuery } from '../../application/queries/reservations/get-reservations.query';
import type { DateOnly } from '../../domain/common/date-only';
import { IdParameterPipe } from '../binding/id-parameter.pipe';
import { OptionalDateOnlyPipe, OptionalStringPipe } from '../binding/query-parameter.pipes';

@ApiTags('Reservations')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly mediator: IMediator) {}

  @Get()
  getAll(
    @Query('guestName', OptionalStringPipe) guestName?: string,
    @Query('roomNumber', OptionalStringPipe) roomNumber?: string,
    @Query('checkInDate', OptionalDateOnlyPipe) checkInDate?: DateOnly,
    @Query('checkOutDate', OptionalDateOnlyPipe) checkOutDate?: DateOnly,
    @Query('status', OptionalStringPipe) status?: string,
  ): Promise<ReservationDto[]> {
    return this.mediator.send(new GetReservationsQuery(guestName, roomNumber, checkInDate, checkOutDate, status));
  }

  @Get(':id')
  getById(@Param('id', IdParameterPipe) id: number): Promise<ReservationDto> {
    return this.mediator.send(new GetReservationByIdQuery(id));
  }

  @Post()
  create(@Body() command: CreateReservationCommand): Promise<ReservationDto> {
    return this.mediator.send(command);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@Param('id', IdParameterPipe) id: number): Promise<ReservationDto> {
    return this.mediator.send(new CancelReservationCommand(id));
  }
}
