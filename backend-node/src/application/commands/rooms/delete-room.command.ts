import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { todayUtc } from '../../../domain/common/date-only';
import { AuditLog } from '../../../domain/entities/audit-log';
import { ReservationStatus } from '../../../domain/enums/reservation-status';
import { ConflictException } from '../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { ICurrentUserService } from '../../common/interfaces/current-user.service';
import { IAuditLogRepository } from '../../common/interfaces/repositories/audit-log.repository';
import { IReservationRepository } from '../../common/interfaces/repositories/reservation.repository';
import { IRoomRepository } from '../../common/interfaces/repositories/room.repository';
import { IUnitOfWork } from '../../common/interfaces/repositories/unit-of-work';
import { ISignalRNotificationService } from '../../common/interfaces/signalr-notification.service';

export class DeleteRoomCommand extends Command<void> {
  constructor(public readonly id: number) {
    super();
  }
}

@CommandHandler(DeleteRoomCommand)
export class DeleteRoomCommandHandler implements ICommandHandler<DeleteRoomCommand, void> {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly reservationRepository: IReservationRepository,
    private readonly auditLogRepository: IAuditLogRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly currentUserService: ICurrentUserService,
    private readonly signalRService: ISignalRNotificationService,
  ) {}

  async execute(request: DeleteRoomCommand): Promise<void> {
    await this.unitOfWork.executeTransaction(async () => {
      const room = await this.roomRepository.getByIdWithReservations(request.id);
      if (!room) {
        throw new NotFoundException('Room', request.id);
      }

      const today = todayUtc();
      const reservations = room.reservations ?? [];
      const hasFutureConfirmed = reservations.some(
        (r) => r.status === ReservationStatus.Confirmed && r.checkOutDate >= today,
      );
      if (hasFutureConfirmed) {
        throw new ConflictException('Cannot delete room with active or future confirmed reservations.');
      }

      const roomNumber = room.roomNumber;

      if (reservations.length > 0) {
        await this.reservationRepository.removeRange(reservations);
      }
      await this.roomRepository.delete(room);

      await this.auditLogRepository.add(
        Object.assign(new AuditLog(), {
          action: 'Deleted',
          entityName: 'Room',
          entityId: String(request.id),
          userId: this.currentUserService.userId ?? 0,
          actionDate: new Date(),
          details: `Deleted room ${roomNumber} (ID: ${request.id})`,
        }),
      );
    });

    await this.signalRService.notifyRoomDeleted(request.id);
  }
}
