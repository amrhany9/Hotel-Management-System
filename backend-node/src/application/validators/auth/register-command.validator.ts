import { IsEmail, MaxLength, MinLength } from 'class-validator';
import { RegisterCommand } from '../../commands/auth/register.command';
import { IsNotBlank } from '../../common/validation/custom.validators';
import { ValidatorFor } from '../../common/validation/validator-for.decorator';

@ValidatorFor(RegisterCommand)
export class RegisterCommandValidator {
  @IsNotBlank({ message: 'Full Name is required.' })
  @MaxLength(100, { message: 'Full Name must not exceed 100 characters.' })
  fullName: string;

  @IsNotBlank({ message: 'Email is required.' })
  @IsEmail({}, { message: 'A valid email address is required.' })
  @MaxLength(150, { message: 'Email must not exceed 150 characters.' })
  email: string;

  @IsNotBlank({ message: 'Password is required.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password: string;
}
