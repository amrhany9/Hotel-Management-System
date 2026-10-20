import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import type { DateOnly } from '../../../domain/common/date-only';
import { ValidationException } from '../../common/exceptions/validation.exception';
import { IRoomRepository } from '../../common/interfaces/repositories/room.repository';
import { RoomDto } from '../../dtos/rooms/room.dto';

export class GetAvailableRoomsQuery extends Query<RoomDto[]> {
  constructor(
    public readonly roomType?: string,
    public readonly minPrice?: number,
    public readonly maxPrice?: number,
    public readonly checkIn?: DateOnly,
    public readonly checkOut?: DateOnly,
  ) {
    super();
  }
}

@QueryHandler(GetAvailableRoomsQuery)
export class GetAvailableRoomsQueryHandler implements IQueryHandler<GetAvailableRoomsQuery, RoomDto[]> {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(request: GetAvailableRoomsQuery): Promise<RoomDto[]> {
    if (request.checkIn && request.checkOut && request.checkOut <= request.checkIn) {
      throw ValidationException.forProperty('CheckOut', 'Check-out date must be after check-in date.');
    }

    const rooms = await this.roomRepository.getAvailableRooms({
      roomType: request.roomType,
      minPrice: request.minPrice,
      maxPrice: request.maxPrice,
      checkIn: request.checkIn,
      checkOut: request.checkOut,
    });
    return rooms.map(RoomDto.from);
  }
}
