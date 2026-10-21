import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from '../../../domain/entities/user';
import { ConflictException } from '../../common/exceptions/conflict.exception';
import { IJwtTokenGenerator } from '../../common/interfaces/jwt-token-generator';
import { IPasswordHasherService } from '../../common/interfaces/password-hasher.service';
import { IUserRepository } from '../../common/interfaces/repositories/user.repository';
import { AuthResponseDto } from '../../dtos/auth/auth-response.dto';

export class RegisterCommand extends Command<AuthResponseDto> {
  fullName: string;
  email: string;
  password: string;

  constructor(init?: Partial<RegisterCommand>) {
    super();
    Object.assign(this, init);
  }
}

@CommandHandler(RegisterCommand)
export class RegisterCommandHandler implements ICommandHandler<RegisterCommand, AuthResponseDto> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasherService,
    private readonly jwtTokenGenerator: IJwtTokenGenerator,
  ) {}

  async execute(request: RegisterCommand): Promise<AuthResponseDto> {
    const emailLower = request.email.trim().toLowerCase();

    if (await this.userRepository.existsByEmail(emailLower)) {
      throw new ConflictException(`User with email '${request.email}' already exists.`);
    }

    const user = Object.assign(new User(), {
      fullName: request.fullName.trim(),
      email: emailLower,
      passwordHash: await this.passwordHasher.hashPassword(request.password),
      isActive: true,
      createdAt: new Date(),
    });
    await this.userRepository.add(user);

    return {
      token: await this.jwtTokenGenerator.generateToken(user),
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
    };
  }
}
