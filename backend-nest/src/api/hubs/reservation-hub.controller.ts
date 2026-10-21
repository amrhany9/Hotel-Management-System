import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ICurrentUserService } from '../../application/common/interfaces/current-user.service';
import { UnauthorizedAccessException } from '../../application/common/exceptions/unauthorized-access.exception';
import { ReservationHub } from './reservation.hub';
import type { NegotiateResponse } from './signalr/signalr-protocol';

@ApiExcludeController()
@Controller('hubs/reservations')
export class ReservationHubController {
  constructor(
    private readonly hub: ReservationHub,
    private readonly currentUser: ICurrentUserService,
  ) {}

  @Post('negotiate')
  @HttpCode(HttpStatus.OK)
  negotiate(): NegotiateResponse {
    const userId = this.currentUser.userId;
    if (!userId) {
      throw new UnauthorizedAccessException();
    }
    return this.hub.negotiate({
      userId,
      email: this.currentUser.email ?? '',
      fullName: this.currentUser.fullName ?? '',
    });
  }
}
