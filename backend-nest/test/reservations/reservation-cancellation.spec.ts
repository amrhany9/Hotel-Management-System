import {
  CancelReservationCommand,
  CancelReservationCommandHandler,
} from '../../src/application/commands/reservations/cancel-reservation.command';
import { ConflictException } from '../../src/application/common/exceptions/conflict.exception';
import { ReservationStatus } from '../../src/domain/enums/reservation-status';
import { createTestDbContext, mockCurrentUser, mockSignalR, SignalRMock, TestDbContext } from '../common/test-db-context.factory';

describe('ReservationCancellationTests', () => {
  let context: TestDbContext;
  let signalR: SignalRMock;
  let handler: CancelReservationCommandHandler;
  let roomId: number;
  let userId: number;

  beforeEach(async () => {
    context = await createTestDbContext();
    signalR = mockSignalR();
    userId = (await context.addUser()).id;
    roomId = (await context.addRoom()).id;

    handler = new CancelReservationCommandHandler(
      context.reservations,
      context.auditLogs,
      context.unitOfWork,
      mockCurrentUser(userId),
      signalR,
    );
  });

  afterEach(() => context.dispose());

  it('CancelReservation_WhenConfirmed_SucceedsAndSetsStatusCancelled', async () => {
    const reservation = await context.addReservation({ roomId, createdBy: userId });

    const result = await handler.execute(new CancelReservationCommand(reservation.id));

    expect(result.status).toBe('Cancelled');
    expect((await context.reservations.getById(reservation.id))?.status).toBe(ReservationStatus.Cancelled);
    expect(signalR.notifyReservationCancelled).toHaveBeenCalledTimes(1);
    expect(signalR.notifyReservationCancelled).toHaveBeenCalledWith(reservation.id);
  });

  it('CancelReservation_WhenAlreadyCancelled_ThrowsConflictException', async () => {
    const reservation = await context.addReservation({ roomId, createdBy: userId, status: ReservationStatus.Cancelled });

    await expect(handler.execute(new CancelReservationCommand(reservation.id))).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
