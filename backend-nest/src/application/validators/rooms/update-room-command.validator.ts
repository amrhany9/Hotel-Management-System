import { IsBoolean, IsInt, IsNumber, IsPositive, MaxLength, Min } from 'class-validator';
import { UpdateRoomCommand } from '../../commands/rooms/update-room.command';
import { IsNotBlank } from '../../common/validation/custom.validators';
import { ValidatorFor } from '../../common/validation/validator-for.decorator';

@ValidatorFor(UpdateRoomCommand)
export class UpdateRoomCommandValidator {
  @IsInt({ message: 'Valid Room ID is required.' })
  @Min(1, { message: 'Valid Room ID is required.' })
  id: number;

  @IsNotBlank({ message: 'Room number is required.' })
  @MaxLength(50, { message: 'Room number must not exceed 50 characters.' })
  roomNumber: string;

  @IsNotBlank({ message: 'Room type is required.' })
  @MaxLength(50, { message: 'Room type must not exceed 50 characters.' })
  roomType: string;

  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 2 }, { message: 'Price per night must be a number with at most 2 decimal places.' })
  @IsPositive({ message: 'Price per night must be greater than zero.' })
  pricePerNight: number;

  @IsBoolean({ message: 'IsAvailable must be true or false.' })
  isAvailable: boolean;
}
