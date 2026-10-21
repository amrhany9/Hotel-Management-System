import { IsEmail } from 'class-validator';
import { LoginCommand } from '../../commands/auth/login.command';
import { IsNotBlank } from '../../common/validation/custom.validators';
import { ValidatorFor } from '../../common/validation/validator-for.decorator';

@ValidatorFor(LoginCommand)
export class LoginCommandValidator {
  @IsNotBlank({ message: 'Email is required.' })
  @IsEmail({}, { message: 'A valid email address is required.' })
  email: string;

  @IsNotBlank({ message: 'Password is required.' })
  password: string;
}
