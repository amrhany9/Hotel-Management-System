import { Injectable, OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Server } from 'node:http';
import type { AuthenticatedUser } from '../../infrastructure/authentication/authenticated-user';
import { JwtTokenValidator } from '../../infrastructure/authentication/jwt-token-validator';
import { SignalRHub } from './signalr/signalr-hub';

export const RESERVATION_HUB_PATH = '/hubs/reservations';

@Injectable()
export class ReservationHub
  extends SignalRHub<AuthenticatedUser>
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    tokenValidator: JwtTokenValidator,
  ) {
    super({
      path: RESERVATION_HUB_PATH,
      authenticate: (token) => (token ? tokenValidator.validate(token) : Promise.resolve(null)),
      isSameUser: (a, b) => a.userId === b.userId,
      describeUser: (user) => user.fullName || user.email,
    });
  }

  onApplicationBootstrap(): void {
    this.attach(this.httpAdapterHost.httpAdapter.getHttpServer() as Server);
  }

  onApplicationShutdown(): void {
    this.shutdown();
  }
}
