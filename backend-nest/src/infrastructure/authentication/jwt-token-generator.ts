import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import { IJwtTokenGenerator } from '../../application/common/interfaces/jwt-token-generator';
import { APP_CONFIG, AppConfig } from '../../config/app.config';
import type { User } from '../../domain/entities/user';
import { JwtPayload } from './authenticated-user';

@Injectable()
export class JwtTokenGenerator implements IJwtTokenGenerator {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  generateToken(user: User): Promise<string> {
    const claims: JwtPayload = {
      sub: String(user.id),
      nameid: String(user.id),
      email: user.email,
      unique_name: user.fullName,
      jti: randomUUID(),
    };
    return this.jwtService.signAsync(claims, {
      secret: this.config.jwt.key,
      algorithm: 'HS256',
      issuer: this.config.jwt.issuer,
      audience: this.config.jwt.audience,
      expiresIn: this.config.jwt.expiryMinutes * 60,
    });
  }
}
