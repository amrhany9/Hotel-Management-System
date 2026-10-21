import {
  CreateReservationCommand,
  CreateReservationCommandHandler,
} from '../../src/application/commands/reservations/create-reservation.command';
import { ConflictException } from '../../src/application/common/exceptions/conflict.exception';
import { NotFoundException } from '../../src/application/common/exceptions/not-found.exception';
import { ValidationException } from '../../src/application/common/exceptions/validation.exception';
import { AuditLog } from '../../src/domain/entities/audit-log';
import { Reservation } from '../../src/domain/entities/reservation';
import { ReservationStatus } from '../../src/domain/enums/reservation-status';
import { createTestDbContext, mockCurrentUser, mockSignalR, SignalRMock, TestDbContext } from '../common/test-db-context.factory';

describe('ReservationOverlapTests', () => {
  let context: TestDbContext;
  let signalR: SignalRMock;
  let handler: CreateReservationCommandHandler;
  let roomId: number;
  let userId: number;

  beforeEach(async () => {
    context = await createTestDbContext();
    signalR = mockSignalR();
    userId = (await context.addUser()).id;
    roomId = (await context.addRoom({ pricePerNight: 100 })).id;

    handler = new CreateReservationCommandHandler(
      context.rooms,
      context.reservations,
      context.users,
      context.auditLogs,
      context.unitOfWork,
      mockCurrentUser(userId),
      signalR,
    );
  });

  afterEach(() => context.dispose());

  it('CreateReservation_WhenDatesOverlapExistingConfirmed_ThrowsConflictException', async () => {
    await context.addReservation({ roomId, createdBy: userId, checkInDate: '2026-09-01', checkOutDate: '2026-09-05' });

    const command = new CreateReservationCommand({
      roomId,
      guestName: 'New Guest',
      checkInDate: '2026-09-04',
      checkOutDate: '2026-09-10',
    });

    await expect(handler.execute(command)).rejects.toBeInstanceOf(ConflictException);
    expect(signalR.notifyReservationCreated).not.toHaveBeenCalled();
  });

  it('CreateReservation_WhenDatesAreAdjacent_SucceedsAndCalculatesTotal', async () => {
    await context.addReservation({ roomId, createdBy: userId, checkInDate: '2026-09-01', checkOutDate: '2026-09-05' });

    const command = new CreateReservationCommand({
      roomId,
      guestName: 'New Guest',
      checkInDate: '2026-09-05',
      checkOutDate: '2026-09-10',
    });

    const result = await handler.execute(command);

    expect(result.nights).toBe(5);
    expect(result.totalAmount).toBe(500);
    expect(result.status).toBe('Confirmed');
    expect(result.createdByName).toBe('Admin User');
    expect(signalR.notifyReservationCreated).toHaveBeenCalledWith(result);
    expect(await context.count(AuditLog)).toBe(1);
  });

  it('CreateReservation_WhenExistingReservationIsCancelled_DoesNotBlock', async () => {
    await context.addReservation({ roomId, createdBy: userId, status: ReservationStatus.Cancelled });

    const command = new CreateReservationCommand({
      roomId,
      guestName: 'New Guest',
      checkInDate: '2026-09-01',
      checkOutDate: '2026-09-05',
    });

    const result = await handler.execute(command);

    expect(result.nights).toBe(4);
    expect(result.totalAmount).toBe(400);
  });

  it('CreateReservation_WhenCheckOutBeforeOrEqualToCheckIn_ThrowsValidationException', async () => {
    const command = new CreateReservationCommand({
      roomId,
      guestName: 'Invalid Guest',
      checkInDate: '2026-09-05',
      checkOutDate: '2026-09-05',
    });

    await expect(handler.execute(command)).rejects.toBeInstanceOf(ValidationException);
  });

  it('CreateReservation_WhenRoomDoesNotExist_ThrowsNotFoundException', async () => {
    const command = new CreateReservationCommand({
      roomId: 999,
      guestName: 'Guest',
      checkInDate: '2026-09-01',
      checkOutDate: '2026-09-02',
    });

    await expect(handler.execute(command)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('CreateReservation_WhenAuditLogFails_RollsBackTheReservation', async () => {
    jest.spyOn(context.auditLogs, 'add').mockRejectedValueOnce(new Error('disk full'));

    const command = new CreateReservationCommand({
      roomId,
      guestName: 'Guest',
      checkInDate: '2026-09-01',
      checkOutDate: '2026-09-03',
    });

    await expect(handler.execute(command)).rejects.toThrow('disk full');
    expect(await context.count(Reservation)).toBe(0);
    expect(signalR.notifyReservationCreated).not.toHaveBeenCalled();
  });
});
