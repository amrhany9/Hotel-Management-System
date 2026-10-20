import type { User } from '../../../domain/entities/user';

export abstract class IJwtTokenGenerator {
  abstract generateToken(user: User): Promise<string>;
}
