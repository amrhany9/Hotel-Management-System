import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { APP_CONFIG, AppConfig } from '../../config/app.config';
import { AuthenticatedUser, JwtPayload } from './authenticated-user';

@Injectable()
export class JwtTokenValidator {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async validate(token: string): Promise<AuthenticatedUser | null> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.config.jwt.key,
        algorithms: ['HS256'],
        issuer: this.config.jwt.issuer,
        audience: this.config.jwt.audience,
        clockTolerance: 0,
      });
      const userId = Number.parseInt(payload.nameid ?? payload.sub, 10);
      if (!Number.isInteger(userId) || userId <= 0) return null;

      const email = Array.isArray(payload.email) ? payload.email[0] : payload.email;
      return { userId, email: email ?? '', fullName: payload.unique_name ?? '' };
    } catch {
      return null;
    }
  }
}
