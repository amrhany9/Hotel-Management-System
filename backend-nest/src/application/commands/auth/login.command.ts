import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ValidationException } from '../../common/exceptions/validation.exception';
import { IJwtTokenGenerator } from '../../common/interfaces/jwt-token-generator';
import { IPasswordHasherService } from '../../common/interfaces/password-hasher.service';
import { IUserRepository } from '../../common/interfaces/repositories/user.repository';
import { AuthResponseDto } from '../../dtos/auth/auth-response.dto';

export class LoginCommand extends Command<AuthResponseDto> {
  email: string;
  password: string;

  constructor(init?: Partial<LoginCommand>) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand, AuthResponseDto> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasherService,
    private readonly jwtTokenGenerator: IJwtTokenGenerator,
  ) {}

  async execute(request: LoginCommand): Promise<AuthResponseDto> {
    const emailLower = request.email.trim().toLowerCase();
    const user = await this.userRepository.getByEmail(emailLower);

    if (!user || !(await this.passwordHasher.verifyPassword(user.passwordHash, request.password))) {
      throw ValidationException.forProperty('Email', 'Invalid email or password.');
    }

    if (!user.isActive) {
      throw ValidationException.forProperty('User', 'This account has been deactivated.');
    }

    return {
      token: await this.jwtTokenGenerator.generateToken(user),
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
    };
  }
}
