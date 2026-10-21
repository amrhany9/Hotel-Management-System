import { DeleteRoomCommand, DeleteRoomCommandHandler } from '../../src/application/commands/rooms/delete-room.command';
import { ConflictException } from '../../src/application/common/exceptions/conflict.exception';
import { addDays, todayUtc } from '../../src/domain/common/date-only';
import { Reservation } from '../../src/domain/entities/reservation';
import { Room } from '../../src/domain/entities/room';
import { ReservationStatus } from '../../src/domain/enums/reservation-status';
import { createTestDbContext, mockCurrentUser, mockSignalR, SignalRMock, TestDbContext } from '../common/test-db-context.factory';

describe('RoomDeletionTests', () => {
  let context: TestDbContext;
  let signalR: SignalRMock;
  let handler: DeleteRoomCommandHandler;
  let userId: number;

  beforeEach(async () => {
    context = await createTestDbContext();
    signalR = mockSignalR();
    userId = (await context.addUser()).id;

    handler = new DeleteRoomCommandHandler(
      context.rooms,
      context.reservations,
      context.auditLogs,
      context.unitOfWork,
      mockCurrentUser(userId),
      signalR,
    );
  });

  afterEach(() => context.dispose());

  it('DeleteRoom_WhenHasFutureConfirmedReservation_ThrowsConflictException', async () => {
    const room = await context.addRoom();
    const futureDate = addDays(todayUtc(), 10);
    await context.addReservation({
      roomId: room.id,
      createdBy: userId,
      checkInDate: futureDate,
      checkOutDate: addDays(futureDate, 3),
    });

    await expect(handler.execute(new DeleteRoomCommand(room.id))).rejects.toBeInstanceOf(ConflictException);
    expect(await context.count(Room)).toBe(1);
  });

  it('DeleteRoom_WhenOnlyHasPastOrCancelledReservations_Succeeds', async () => {
    const room = await context.addRoom();
    const futureDate = addDays(todayUtc(), 10);
    await context.addReservation({ roomId: room.id, createdBy: userId, checkInDate: '2020-01-01', checkOutDate: '2020-01-05' });
    await context.addReservation({
      roomId: room.id,
      createdBy: userId,
      checkInDate: futureDate,
      checkOutDate: addDays(futureDate, 2),
      status: ReservationStatus.Cancelled,
    });

    await handler.execute(new DeleteRoomCommand(room.id));

    expect(await context.count(Room)).toBe(0);
    expect(await context.count(Reservation)).toBe(0);
    expect(signalR.notifyRoomDeleted).toHaveBeenCalledWith(room.id);
  });
});
