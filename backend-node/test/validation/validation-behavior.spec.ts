import { APPLICATION_VALIDATORS } from '../../src/application/application.module';
import { CreateReservationCommand } from '../../src/application/commands/reservations/create-reservation.command';
import { RegisterCommand } from '../../src/application/commands/auth/register.command';
import { ValidationBehavior } from '../../src/application/common/behaviors/validation.behavior';
import { ValidationException } from '../../src/application/common/exceptions/validation.exception';
import { GetRevenueReportQuery } from '../../src/application/queries/reports/get-revenue-report.query';
import { GetRoomsQuery } from '../../src/application/queries/rooms/get-rooms.query';

describe('ValidationBehaviorTests', () => {
  const behavior = new ValidationBehavior(APPLICATION_VALIDATORS);

  const failuresOf = async (request: object): Promise<Record<string, string[]>> => {
    const next = jest.fn().mockResolvedValue('handled');
    try {
      await behavior.handle(request, next);
    } catch (error) {
      expect(next).not.toHaveBeenCalled();
      expect(error).toBeInstanceOf(ValidationException);
      return (error as ValidationException).errors;
    }
    throw new Error('Expected a ValidationException');
  };

  it('Register_WithMissingAndInvalidFields_ReturnsOneMessageListPerProperty', async () => {
    const errors = await failuresOf(new RegisterCommand({ email: 'bad', password: '1' }));

    expect(errors).toEqual({
      FullName: ['Full Name is required.'],
      Email: ['A valid email address is required.'],
      Password: ['Password must be at least 6 characters long.'],
    });
  });

  it('CreateReservation_WithCheckOutNotAfterCheckIn_FailsOnCheckOutDate', async () => {
    const errors = await failuresOf(
      new CreateReservationCommand({ roomId: 1, guestName: 'Guest', checkInDate: '2026-09-05', checkOutDate: '2026-09-05' }),
    );

    expect(errors).toEqual({ CheckOutDate: ['Check-out date must be after check-in date.'] });
  });

  it('RevenueReport_WithoutDates_RequiresFromAndTo', async () => {
    const errors = await failuresOf(new GetRevenueReportQuery(undefined as never, undefined as never));

    expect(errors).toEqual({ From: ['From date is required.'], To: ['To date is required.'] });
  });

  it('Requests_WithoutValidator_PassThroughToTheHandler', async () => {
    const next = jest.fn().mockResolvedValue('handled');

    await expect(behavior.handle(new GetRoomsQuery(), next)).resolves.toBe('handled');
    expect(next).toHaveBeenCalledTimes(1);
  });
});
