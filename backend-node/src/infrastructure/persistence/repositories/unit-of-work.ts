import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { AsyncLocalStorage } from 'node:async_hooks';
import { DataSource, EntityManager } from 'typeorm';
import { IUnitOfWork } from '../../../application/common/interfaces/repositories/unit-of-work';

@Injectable()
export class UnitOfWork implements IUnitOfWork {
  private readonly storage = new AsyncLocalStorage<EntityManager>();

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  get manager(): EntityManager {
    return this.storage.getStore() ?? this.dataSource.manager;
  }

  get isInTransaction(): boolean {
    return this.storage.getStore() !== undefined;
  }

  get supportsRowLocks(): boolean {
    return this.dataSource.options.type === 'mssql';
  }

  async executeTransaction<T>(action: () => Promise<T>): Promise<T> {
    if (this.isInTransaction) {
      return action();
    }
    return this.dataSource.transaction((manager) => this.storage.run(manager, action));
  }
}
