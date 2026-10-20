import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuditLog } from '../../../domain/entities/audit-log';
import type { Room } from '../../../domain/entities/room';
import { ConflictException } from '../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { ICurrentUserService } from '../../common/interfaces/current-user.service';
import { IAuditLogRepository } from '../../common/interfaces/repositories/audit-log.repository';
import { IRoomRepository } from '../../common/interfaces/repositories/room.repository';
import { IUnitOfWork } from '../../common/interfaces/repositories/unit-of-work';
import { ISignalRNotificationService } from '../../common/interfaces/signalr-notification.service';
import { RoomDto } from '../../dtos/rooms/room.dto';

export class UpdateRoomCommand extends Command<RoomDto> {
  id: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  isAvailable: boolean;

  constructor(init?: Partial<UpdateRoomCommand>) {
    super();
    Object.assign(this, init);
  }
}

const describeRoom = (room: Room): string =>
  `Room ${room.roomNumber} (${room.roomType}, $${room.pricePerNight}, Available: ${room.isAvailable ? 'True' : 'False'})`;

@CommandHandler(UpdateRoomCommand)
export class UpdateRoomCommandHandler implements ICommandHandler<UpdateRoomCommand, RoomDto> {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly auditLogRepository: IAuditLogRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly currentUserService: ICurrentUserService,
    private readonly signalRService: ISignalRNotificationService,
  ) {}

  async execute(request: UpdateRoomCommand): Promise<RoomDto> {
    const dto = await this.unitOfWork.executeTransaction(async () => {
      const room = await this.roomRepository.getById(request.id);
      if (!room) {
        throw new NotFoundException('Room', request.id);
      }

      const trimmedNumber = request.roomNumber.trim();
      if (await this.roomRepository.existsByRoomNumber(trimmedNumber, request.id)) {
        throw new ConflictException(`Room number '${request.roomNumber}' is already in use by another room.`);
      }

      const oldInfo = describeRoom(room);

      room.roomNumber = trimmedNumber;
      room.roomType = request.roomType.trim();
      room.pricePerNight = request.pricePerNight;
      room.isAvailable = request.isAvailable;
      await this.roomRepository.update(room);

      await this.auditLogRepository.add(
        Object.assign(new AuditLog(), {
          action: 'Updated',
          entityName: 'Room',
          entityId: String(room.id),
          userId: this.currentUserService.userId ?? 0,
          actionDate: new Date(),
          details: `Updated room ${room.id}: ${oldInfo} -> ${describeRoom(room)}`,
        }),
      );

      return RoomDto.from(room);
    });

    await this.signalRService.notifyRoomUpdated(dto);

    return dto;
  }
}
