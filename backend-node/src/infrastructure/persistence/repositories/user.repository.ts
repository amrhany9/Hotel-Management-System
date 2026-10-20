import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../application/common/interfaces/repositories/user.repository';
import { User } from '../../../domain/entities/user';
import { UnitOfWork } from './unit-of-work';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  private get users(): Repository<User> {
    return this.unitOfWork.manager.getRepository(User);
  }

  getById(id: number): Promise<User | null> {
    return this.users.findOneBy({ id });
  }

  getByEmail(email: string): Promise<User | null> {
    return this.users
      .createQueryBuilder('u')
      .where('LOWER(u.email) = :email', { email: email.trim().toLowerCase() })
      .getOne();
  }

  async existsByEmail(email: string): Promise<boolean> {
    return (await this.getByEmail(email)) !== null;
  }

  add(user: User): Promise<User> {
    return this.users.save(user);
  }
}
