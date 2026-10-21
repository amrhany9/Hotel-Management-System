import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { IRoomRepository } from '../../common/interfaces/repositories/room.repository';
import { RoomDto } from '../../dtos/rooms/room.dto';

export class GetRoomByIdQuery extends Query<RoomDto> {
  constructor(public readonly id: number) {
    super();
  }
}

@QueryHandler(GetRoomByIdQuery)
export class GetRoomByIdQueryHandler implements IQueryHandler<GetRoomByIdQuery, RoomDto> {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(request: GetRoomByIdQuery): Promise<RoomDto> {
    const room = await this.roomRepository.getById(request.id);
    if (!room) {
      throw new NotFoundException('Room', request.id);
    }
    return RoomDto.from(room);
  }
}
