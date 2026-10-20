import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { AppConfig } from '../../config/app.config';
import { ENTITY_CONFIGURATIONS } from './configurations';
import { InitialSchema1756836554000 } from './migrations/1756836554000-InitialSchema';

export function createTypeOrmOptions(config: AppConfig): TypeOrmModuleOptions {
  const db = config.database;

  if (db.type === 'sqlite') {
    const inMemory = db.sqlitePath === ':memory:';
    const location = inMemory ? undefined : resolve(db.sqlitePath);
    if (location) {
      mkdirSync(dirname(location), { recursive: true });
    }
    return {
      type: 'sqljs',
      location,
      autoSave: !inMemory,
      entities: ENTITY_CONFIGURATIONS,
      synchronize: true,
      logging: db.logging,
    };
  }

  return {
    type: 'mssql',
    host: db.host,
    port: db.instanceName ? undefined : db.port,
    username: db.username,
    password: db.password,
    database: db.name,
    entities: ENTITY_CONFIGURATIONS,
    migrations: [InitialSchema1756836554000],
    migrationsRun: true,
    synchronize: false,
    logging: db.logging,
    options: {
      instanceName: db.instanceName,
      encrypt: db.encrypt,
      trustServerCertificate: db.trustServerCertificate,
      useUTC: true,
    },
    pool: { max: db.poolMax, min: 0 },
    retryAttempts: 3,
    retryDelay: 3000,
  };
}
