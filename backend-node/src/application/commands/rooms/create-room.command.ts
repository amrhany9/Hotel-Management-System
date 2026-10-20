import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuditLog } from '../../../domain/entities/audit-log';
import { Room } from '../../../domain/entities/room';
import { ConflictException } from '../../common/exceptions/conflict.exception';
import { ICurrentUserService } from '../../common/interfaces/current-user.service';
import { IAuditLogRepository } from '../../common/interfaces/repositories/audit-log.repository';
import { IRoomRepository } from '../../common/interfaces/repositories/room.repository';
import { IUnitOfWork } from '../../common/interfaces/repositories/unit-of-work';
import { ISignalRNotificationService } from '../../common/interfaces/signalr-notification.service';
import { RoomDto } from '../../dtos/rooms/room.dto';

export class CreateRoomCommand extends Command<RoomDto> {
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  isAvailable?: boolean;

  constructor(init?: Partial<CreateRoomCommand>) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(CreateRoomCommand)
export class CreateRoomCommandHandler implements ICommandHandler<CreateRoomCommand, RoomDto> {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly auditLogRepository: IAuditLogRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly currentUserService: ICurrentUserService,
    private readonly signalRService: ISignalRNotificationService,
  ) {}

  async execute(request: CreateRoomCommand): Promise<RoomDto> {
    const dto = await this.unitOfWork.executeTransaction(async () => {
      const trimmedNumber = request.roomNumber.trim();
      if (await this.roomRepository.existsByRoomNumber(trimmedNumber)) {
        throw new ConflictException(`Room number '${request.roomNumber}' already exists.`);
      }

      const room = Object.assign(new Room(), {
        roomNumber: trimmedNumber,
        roomType: request.roomType.trim(),
        pricePerNight: request.pricePerNight,
        isAvailable: request.isAvailable ?? true,
        createdAt: new Date(),
      });
      await this.roomRepository.add(room);

      await this.auditLogRepository.add(
        Object.assign(new AuditLog(), {
          action: 'Created',
          entityName: 'Room',
          entityId: String(room.id),
          userId: this.currentUserService.userId ?? 0,
          actionDate: new Date(),
          details: `Created room ${room.roomNumber} (${room.roomType}) at $${room.pricePerNight}/night`,
        }),
      );

      return RoomDto.from(room);
    });

    await this.signalRService.notifyRoomCreated(dto);

    return dto;
  }
}
