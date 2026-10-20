import { ReservationStatus } from '../../src/domain/enums/reservation-status';
import { createTestDbContext, TestDbContext } from '../common/test-db-context.factory';

describe('ReportRepositoryTests', () => {
  let context: TestDbContext;

  beforeEach(async () => {
    context = await createTestDbContext();
    const userId = (await context.addUser()).id;
    const single = await context.addRoom({ roomNumber: '101', roomType: 'Single', pricePerNight: 100 });
    const suite = await context.addRoom({ roomNumber: '301', roomType: 'Suite', pricePerNight: 300 });

    await context.addReservation({ roomId: single.id, createdBy: userId, checkInDate: '2026-08-01', checkOutDate: '2026-08-05', totalAmount: 400 });
    await context.addReservation({ roomId: suite.id, createdBy: userId, checkInDate: '2026-08-08', checkOutDate: '2026-08-14', totalAmount: 1800 });
    await context.addReservation({
      roomId: suite.id,
      createdBy: userId,
      checkInDate: '2026-08-01',
      checkOutDate: '2026-08-03',
      totalAmount: 600,
      status: ReservationStatus.Cancelled,
    });
  });

  afterEach(() => context.dispose());

  it('GetRevenueReport_ProRatesRevenueToNightsInsideTheRange', async () => {
    const report = await context.reports.getRevenueReport('2026-08-01', '2026-08-10');

    expect(report).toEqual({
      totalReservations: 2,
      totalNights: 6,
      totalRevenue: 1000,
      byRoomType: [
        { roomType: 'Single', reservationCount: 1, totalNights: 4, totalRevenue: 400 },
        { roomType: 'Suite', reservationCount: 1, totalNights: 2, totalRevenue: 600 },
      ],
    });
  });

  it('GetOccupancyReport_CountsCheckInButNotCheckOutDay', async () => {
    const report = await context.reports.getOccupancyReport('2026-08-01', '2026-08-11');

    expect(report).toEqual([
      { roomNumber: '101', roomType: 'Single', bookedNights: 4, availableNights: 10, occupancyPercentage: 40 },
      { roomNumber: '301', roomType: 'Suite', bookedNights: 3, availableNights: 10, occupancyPercentage: 30 },
    ]);
  });

  it('GetTopRooms_RanksByNonCancelledReservationCountThenRevenue', async () => {
    const report = await context.reports.getTopRooms(5);

    expect(report).toEqual([
      { roomNumber: '301', roomType: 'Suite', reservationCount: 1, totalRevenue: 1800 },
      { roomNumber: '101', roomType: 'Single', reservationCount: 1, totalRevenue: 400 },
    ]);
  });
});
