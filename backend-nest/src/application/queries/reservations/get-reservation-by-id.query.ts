import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '../../common/exceptions/not-found.exception';
import { IReservationRepository } from '../../common/interfaces/repositories/reservation.repository';
import { ReservationDto } from '../../dtos/reservations/reservation.dto';

export class GetReservationByIdQuery extends Query<ReservationDto> {
  constructor(public readonly id: number) {
    super();
  }
}

@QueryHandler(GetReservationByIdQuery)
export class GetReservationByIdQueryHandler implements IQueryHandler<GetReservationByIdQuery, ReservationDto> {
  constructor(private readonly reservationRepository: IReservationRepository) {}

  async execute(request: GetReservationByIdQuery): Promise<ReservationDto> {
    const reservation = await this.reservationRepository.getById(request.id);
    if (!reservation) {
      throw new NotFoundException('Reservation', request.id);
    }
    return ReservationDto.from(reservation);
  }
}
