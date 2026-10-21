import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateRoomCommand } from '../../application/commands/rooms/create-room.command';
import { DeleteRoomCommand } from '../../application/commands/rooms/delete-room.command';
import { UpdateRoomCommand } from '../../application/commands/rooms/update-room.command';
import { IMediator } from '../../application/common/mediator/mediator';
import { RoomDto } from '../../application/dtos/rooms/room.dto';
import { GetAvailableRoomsQuery } from '../../application/queries/rooms/get-available-rooms.query';
import { GetRoomByIdQuery } from '../../application/queries/rooms/get-room-by-id.query';
import { GetRoomsQuery } from '../../application/queries/rooms/get-rooms.query';
import type { DateOnly } from '../../domain/common/date-only';
import { IdParameterPipe } from '../binding/id-parameter.pipe';
import { OptionalDateOnlyPipe, OptionalNumberPipe, OptionalStringPipe } from '../binding/query-parameter.pipes';

@ApiTags('Rooms')
@ApiBearerAuth()
@Controller('rooms')
export class RoomsController {
  constructor(private readonly mediator: IMediator) {}

  @Get()
  getAll(): Promise<RoomDto[]> {
    return this.mediator.send(new GetRoomsQuery());
  }

  @Get('available')
  getAvailable(
    @Query('roomType', OptionalStringPipe) roomType?: string,
    @Query('minPrice', OptionalNumberPipe) minPrice?: number,
    @Query('maxPrice', OptionalNumberPipe) maxPrice?: number,
    @Query('checkIn', OptionalDateOnlyPipe) checkIn?: DateOnly,
    @Query('checkOut', OptionalDateOnlyPipe) checkOut?: DateOnly,
  ): Promise<RoomDto[]> {
    return this.mediator.send(new GetAvailableRoomsQuery(roomType, minPrice, maxPrice, checkIn, checkOut));
  }

  @Get(':id')
  getById(@Param('id', IdParameterPipe) id: number): Promise<RoomDto> {
    return this.mediator.send(new GetRoomByIdQuery(id));
  }

  @Post()
  create(@Body() command: CreateRoomCommand): Promise<RoomDto> {
    return this.mediator.send(command);
  }

  @Put(':id')
  update(@Param('id', IdParameterPipe) id: number, @Body() command: UpdateRoomCommand): Promise<RoomDto> {
    if (id !== command.id) {
      throw new BadRequestException('Route ID does not match request body ID.');
    }
    return this.mediator.send(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', IdParameterPipe) id: number): Promise<void> {
    return this.mediator.send(new DeleteRoomCommand(id));
  }
}
