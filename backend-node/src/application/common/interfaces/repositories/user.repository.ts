import type { User } from '../../../../domain/entities/user';

export abstract class IUserRepository {
  abstract getById(id: number): Promise<User | null>;
  abstract getByEmail(email: string): Promise<User | null>;
  abstract existsByEmail(email: string): Promise<boolean>;
  abstract add(user: User): Promise<User>;
}
