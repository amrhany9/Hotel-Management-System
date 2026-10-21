import { CreateRoomCommand, CreateRoomCommandHandler } from '../../src/application/commands/rooms/create-room.command';
import { UpdateRoomCommand, UpdateRoomCommandHandler } from '../../src/application/commands/rooms/update-room.command';
import { ConflictException } from '../../src/application/common/exceptions/conflict.exception';
import {
  GetAvailableRoomsQuery,
  GetAvailableRoomsQueryHandler,
} from '../../src/application/queries/rooms/get-available-rooms.query';
import { ReservationStatus } from '../../src/domain/enums/reservation-status';
import { createTestDbContext, mockCurrentUser, mockSignalR, SignalRMock, TestDbContext } from '../common/test-db-context.factory';

describe('RoomManagementTests', () => {
  let context: TestDbContext;
  let signalR: SignalRMock;
  let userId: number;

  beforeEach(async () => {
    context = await createTestDbContext();
    signalR = mockSignalR();
    userId = (await context.addUser()).id;
  });

  afterEach(() => context.dispose());

  it('CreateRoom_WhenRoomNumberExistsIgnoringCaseAndSpaces_ThrowsConflictException', async () => {
    await context.addRoom({ roomNumber: 'A1' });
    const handler = new CreateRoomCommandHandler(context.rooms, context.auditLogs, context.unitOfWork, mockCurrentUser(userId), signalR);

    await expect(
      handler.execute(new CreateRoomCommand({ roomNumber: ' a1 ', roomType: 'Suite', pricePerNight: 200 })),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('UpdateRoom_WhenValid_UpdatesAndBroadcasts', async () => {
    const room = await context.addRoom();
    const handler = new UpdateRoomCommandHandler(context.rooms, context.auditLogs, context.unitOfWork, mockCurrentUser(userId), signalR);

    const result = await handler.execute(
      new UpdateRoomCommand({ id: room.id, roomNumber: '101', roomType: 'Deluxe', pricePerNight: 150.5, isAvailable: false }),
    );

    expect(result).toMatchObject({ roomType: 'Deluxe', pricePerNight: 150.5, isAvailable: false });
    expect(signalR.notifyRoomUpdated).toHaveBeenCalledWith(result);
  });

  it('GetAvailableRooms_ExcludesRoomsWithOverlappingActiveReservations', async () => {
    const booked = await context.addRoom({ roomNumber: '101' });
    const cancelledOnly = await context.addRoom({ roomNumber: '102' });
    await context.addRoom({ roomNumber: '103', pricePerNight: 500 });
    await context.addReservation({ roomId: booked.id, createdBy: userId });
    await context.addReservation({ roomId: cancelledOnly.id, createdBy: userId, status: ReservationStatus.Cancelled });
    const handler = new GetAvailableRoomsQueryHandler(context.rooms);

    const rooms = await handler.execute(new GetAvailableRoomsQuery(undefined, undefined, 300, '2026-09-02', '2026-09-03'));

    expect(rooms.map((r) => r.roomNumber)).toEqual(['102']);
  });
});
