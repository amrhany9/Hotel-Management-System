import { AuditLogConfiguration } from './audit-log.configuration';
import { ReservationConfiguration } from './reservation.configuration';
import { RoomConfiguration } from './room.configuration';
import { UserConfiguration } from './user.configuration';

export const ENTITY_CONFIGURATIONS = [UserConfiguration, RoomConfiguration, ReservationConfiguration, AuditLogConfiguration];
