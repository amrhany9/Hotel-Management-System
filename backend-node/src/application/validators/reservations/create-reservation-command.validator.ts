import { IsInt, MaxLength, Min } from 'class-validator';
import { CreateReservationCommand } from '../../commands/reservations/create-reservation.command';
import { IsDateOnly, IsDateOnlyAfter, IsNotBlank } from '../../common/validation/custom.validators';
import { ValidatorFor } from '../../common/validation/validator-for.decorator';

@ValidatorFor(CreateReservationCommand)
export class CreateReservationCommandValidator {
  @IsInt({ message: 'Room ID must be valid.' })
  @Min(1, { message: 'Room ID must be valid.' })
  roomId: number;

  @IsNotBlank({ message: 'Guest Name is required.' })
  @MaxLength(100, { message: 'Guest Name must not exceed 100 characters.' })
  guestName: string;

  @IsDateOnly({ message: 'Check-in date is required.' })
  checkInDate: string;

  @IsDateOnly({ message: 'Check-out date is required.' })
  @IsDateOnlyAfter('checkInDate', { message: 'Check-out date must be after check-in date.' })
  checkOutDate: string;
}
