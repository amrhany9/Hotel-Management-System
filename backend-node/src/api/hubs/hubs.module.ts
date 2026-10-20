import { Global, Module } from '@nestjs/common';
import { ISignalRNotificationService } from '../../application/common/interfaces/signalr-notification.service';
import { ReservationHub } from './reservation.hub';
import { ReservationHubController } from './reservation-hub.controller';
import { SignalRNotificationService } from './signalr-notification.service';

@Global()
@Module({
  controllers: [ReservationHubController],
  providers: [ReservationHub, { provide: ISignalRNotificationService, useClass: SignalRNotificationService }],
  exports: [ISignalRNotificationService],
})
export class HubsModule {}
