import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginCommand } from '../../application/commands/auth/login.command';
import { RegisterCommand } from '../../application/commands/auth/register.command';
import { ICurrentUserService } from '../../application/common/interfaces/current-user.service';
import { IMediator } from '../../application/common/mediator/mediator';
import { AuthResponseDto } from '../../application/dtos/auth/auth-response.dto';
import { CurrentUserDto } from '../../application/dtos/auth/current-user.dto';
import { AllowAnonymous } from '../middleware/allow-anonymous.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly mediator: IMediator,
    private readonly currentUser: ICurrentUserService,
  ) {}

  @AllowAnonymous()
  @Post('register')
  @HttpCode(HttpStatus.OK)
  register(@Body() command: RegisterCommand): Promise<AuthResponseDto> {
    return this.mediator.send(command);
  }

  @AllowAnonymous()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() command: LoginCommand): Promise<AuthResponseDto> {
    return this.mediator.send(command);
  }

  @ApiBearerAuth()
  @Get('me')
  getCurrentUser(): CurrentUserDto {
    return {
      userId: this.currentUser.userId ?? 0,
      email: this.currentUser.email ?? '',
      fullName: this.currentUser.fullName ?? '',
    };
  }
}
