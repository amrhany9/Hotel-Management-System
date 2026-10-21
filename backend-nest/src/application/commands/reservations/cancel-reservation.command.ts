import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuditLog } from '../../../domain/entities/audit-log';
import { ReservationStatus } from '../../../domain/enums/reservation-status';
import { ConflictException } from '../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { ICurrentUserService } from '../../common/interfaces/current-user.service';
import { IAuditLogRepository } from '../../common/interfaces/repositories/audit-log.repository';
import { IReservationRepository } from '../../common/interfaces/repositories/reservation.repository';
import { IUnitOfWork } from '../../common/interfaces/repositories/unit-of-work';
import { ISignalRNotificationService } from '../../common/interfaces/signalr-notification.service';
import { ReservationDto } from '../../dtos/reservations/reservation.dto';

export class CancelReservationCommand extends Command<ReservationDto> {
  constructor(public readonly id: number) {
    super();
  }
}

@CommandHandler(CancelReservationCommand)
export class CancelReservationCommandHandler implements ICommandHandler<CancelReservationCommand, ReservationDto> {
  constructor(
    private readonly reservationRepository: IReservationRepository,
    private readonly auditLogRepository: IAuditLogRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly currentUserService: ICurrentUserService,
    private readonly signalRService: ISignalRNotificationService,
  ) {}

  async execute(request: CancelReservationCommand): Promise<ReservationDto> {
    const userId = this.currentUserService.userId ?? 0;

    const dto = await this.unitOfWork.executeTransaction(async () => {
      const reservation = await this.reservationRepository.getById(request.id);
      if (!reservation) {
        throw new NotFoundException('Reservation', request.id);
      }

      if (reservation.status === ReservationStatus.Cancelled) {
        throw new ConflictException('Reservation is already cancelled.');
      }

      reservation.status = ReservationStatus.Cancelled;
      await this.reservationRepository.update(reservation);

      await this.auditLogRepository.add(
        Object.assign(new AuditLog(), {
          action: 'Cancelled',
          entityName: 'Reservation',
          entityId: String(reservation.id),
          userId,
          actionDate: new Date(),
          details:
            `Cancelled reservation #${reservation.id} for guest '${reservation.guestName}' ` +
            `(Room ${reservation.room?.roomNumber ?? reservation.roomId})`,
        }),
      );

      return ReservationDto.from(reservation);
    });

    await this.signalRService.notifyReservationCancelled(dto.id);

    return dto;
  }
}
