import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { daysBetween, type DateOnly } from '../../../domain/common/date-only';
import { AuditLog } from '../../../domain/entities/audit-log';
import { Reservation } from '../../../domain/entities/reservation';
import { ReservationStatus } from '../../../domain/enums/reservation-status';
import { ConflictException } from '../../common/exceptions/conflict.exception';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { UnauthorizedAccessException } from '../../common/exceptions/unauthorized-access.exception';
import { ValidationException } from '../../common/exceptions/validation.exception';
import { ICurrentUserService } from '../../common/interfaces/current-user.service';
import { IAuditLogRepository } from '../../common/interfaces/repositories/audit-log.repository';
import { IReservationRepository } from '../../common/interfaces/repositories/reservation.repository';
import { IRoomRepository } from '../../common/interfaces/repositories/room.repository';
import { IUnitOfWork } from '../../common/interfaces/repositories/unit-of-work';
import { IUserRepository } from '../../common/interfaces/repositories/user.repository';
import { ISignalRNotificationService } from '../../common/interfaces/signalr-notification.service';
import { roundMoney } from '../../common/utils/money';
import { ReservationDto } from '../../dtos/reservations/reservation.dto';

export class CreateReservationCommand extends Command<ReservationDto> {
  roomId: number;
  guestName: string;
  checkInDate: DateOnly;
  checkOutDate: DateOnly;

  constructor(init?: Partial<CreateReservationCommand>) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(CreateReservationCommand)
export class CreateReservationCommandHandler implements ICommandHandler<CreateReservationCommand, ReservationDto> {
  constructor(
    private readonly roomRepository: IRoomRepository,
    private readonly reservationRepository: IReservationRepository,
    private readonly userRepository: IUserRepository,
    private readonly auditLogRepository: IAuditLogRepository,
    private readonly unitOfWork: IUnitOfWork,
    private readonly currentUserService: ICurrentUserService,
    private readonly signalRService: ISignalRNotificationService,
  ) {}

  async execute(request: CreateReservationCommand): Promise<ReservationDto> {
    const userId = this.currentUserService.userId;
    if (!userId || userId <= 0) {
      throw new UnauthorizedAccessException('User is not authenticated.');
    }

    if (request.checkOutDate <= request.checkInDate) {
      throw ValidationException.forProperty('CheckOutDate', 'Check-out date must be after check-in date.');
    }

    const resultDto = await this.unitOfWork.executeTransaction(async () => {
      const room = await this.roomRepository.getByIdForUpdate(request.roomId);
      if (!room) {
        throw new NotFoundException('Room', request.roomId);
      }

      const hasOverlap = await this.reservationRepository.hasOverlap(
        request.roomId,
        request.checkInDate,
        request.checkOutDate,
      );
      if (hasOverlap) {
        throw new ConflictException('The room is already reserved for the selected date range.');
      }

      const nights = daysBetween(request.checkInDate, request.checkOutDate);
      const totalAmount = roundMoney(nights * room.pricePerNight);

      const reservation = Object.assign(new Reservation(), {
        roomId: room.id,
        guestName: request.guestName.trim(),
        checkInDate: request.checkInDate,
        checkOutDate: request.checkOutDate,
        totalAmount,
        status: ReservationStatus.Confirmed,
        createdBy: userId,
        createdAt: new Date(),
      });
      await this.reservationRepository.add(reservation);

      await this.auditLogRepository.add(
        Object.assign(new AuditLog(), {
          action: 'Created',
          entityName: 'Reservation',
          entityId: String(reservation.id),
          userId,
          actionDate: new Date(),
          details:
            `Created reservation for guest '${reservation.guestName}' in room ${room.roomNumber} ` +
            `(${reservation.checkInDate} to ${reservation.checkOutDate}, ${nights} nights, $${totalAmount})`,
        }),
      );

      const user = await this.userRepository.getById(userId);
      return ReservationDto.from({ ...reservation, room, user: user ?? undefined });
    });

    await this.signalRService.notifyReservationCreated(resultDto);

    return resultDto;
  }
}
