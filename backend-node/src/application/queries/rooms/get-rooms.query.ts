import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { IRoomRepository } from '../../common/interfaces/repositories/room.repository';
import { RoomDto } from '../../dtos/rooms/room.dto';

export class GetRoomsQuery extends Query<RoomDto[]> {}

@QueryHandler(GetRoomsQuery)
export class GetRoomsQueryHandler implements IQueryHandler<GetRoomsQuery, RoomDto[]> {
  constructor(private readonly roomRepository: IRoomRepository) {}

  async execute(): Promise<RoomDto[]> {
    const rooms = await this.roomRepository.getAll();
    return rooms.map(RoomDto.from);
  }
}
