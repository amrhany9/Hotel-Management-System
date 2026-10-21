import { Injectable, Logger } from '@nestjs/common';
import { ISignalRNotificationService } from '../../application/common/interfaces/signalr-notification.service';
import type { ReservationDto } from '../../application/dtos/reservations/reservation.dto';
import type { RoomDto } from '../../application/dtos/rooms/room.dto';
import { ReservationHub } from './reservation.hub';

@Injectable()
export class SignalRNotificationService implements ISignalRNotificationService {
  private readonly logger = new Logger(SignalRNotificationService.name);

  constructor(private readonly hub: ReservationHub) {}

  async notifyReservationCreated(reservation: ReservationDto): Promise<void> {
    this.broadcast('reservationCreated', reservation.id, reservation);
  }

  async notifyReservationCancelled(reservationId: number): Promise<void> {
    this.broadcast('reservationCancelled', reservationId, reservationId);
  }

  async notifyRoomCreated(room: RoomDto): Promise<void> {
    this.broadcast('roomCreated', room.id, room);
  }

  async notifyRoomUpdated(room: RoomDto): Promise<void> {
    this.broadcast('roomUpdated', room.id, room);
  }

  async notifyRoomDeleted(roomId: number): Promise<void> {
    this.broadcast('roomDeleted', roomId, roomId);
  }

  private broadcast(event: string, id: number, payload: unknown): void {
    try {
      this.logger.log(`Broadcasting ${event} event for ID: ${id}`);
      this.hub.broadcast(event, payload);
    } catch (error) {
      this.logger.error(`Failed to broadcast ${event} event`, (error as Error).stack);
    }
  }
}
