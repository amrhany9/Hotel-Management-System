import type { ReservationDto } from '../../dtos/reservations/reservation.dto';
import type { RoomDto } from '../../dtos/rooms/room.dto';

export abstract class ISignalRNotificationService {
  abstract notifyReservationCreated(reservation: ReservationDto): Promise<void>;
  abstract notifyReservationCancelled(reservationId: number): Promise<void>;
  abstract notifyRoomCreated(room: RoomDto): Promise<void>;
  abstract notifyRoomUpdated(room: RoomDto): Promise<void>;
  abstract notifyRoomDeleted(roomId: number): Promise<void>;
}
