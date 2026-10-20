import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AuthenticatedUser } from '../../infrastructure/authentication/authenticated-user';
import { JwtTokenValidator } from '../../infrastructure/authentication/jwt-token-validator';
import { ALLOW_ANONYMOUS_KEY } from './allow-anonymous.decorator';

export type AuthenticatedRequest = Request & { user?: AuthenticatedUser };

@Injectable()
export class JwtAuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenValidator: JwtTokenValidator,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowAnonymous = this.reflector.getAllAndOverride<boolean>(ALLOW_ANONYMOUS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (allowAnonymous) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Missing or invalid Authorization header.');
    }

    const user = await this.tokenValidator.validate(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    request.user = user;
    return true;
  }
}
