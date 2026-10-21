import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import type { DateOnly } from '../../../domain/common/date-only';
import { parseReservationStatus } from '../../../domain/enums/reservation-status';
import { IReservationRepository } from '../../common/interfaces/repositories/reservation.repository';
import { ReservationDto } from '../../dtos/reservations/reservation.dto';

export class GetReservationsQuery extends Query<ReservationDto[]> {
  constructor(
    public readonly guestName?: string,
    public readonly roomNumber?: string,
    public readonly checkInDate?: DateOnly,
    public readonly checkOutDate?: DateOnly,
    public readonly status?: string,
  ) {
    super();
  }
}

@QueryHandler(GetReservationsQuery)
export class GetReservationsQueryHandler implements IQueryHandler<GetReservationsQuery, ReservationDto[]> {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(request: GetReservationsQuery): Promise<ReservationDto[]> {
    const list = await this.reservationRepository.search({
      guestName: request.guestName,
      roomNumber: request.roomNumber,
      checkInDate: request.checkInDate,
      checkOutDate: request.checkOutDate,
      status: parseReservationStatus(request.status),
    });
    return list.map(ReservationDto.from);
  }
}
