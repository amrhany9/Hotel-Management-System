import { z } from 'zod';
import { DEVELOPMENT_JWT_KEY, envSchema, type Env, type LogLevelName } from './env.schema';

export type Environment = Env['NODE_ENV'];
export type DatabaseType = Env['DB_TYPE'];

export interface AppConfig {
  env: Environment;
  isProduction: boolean;
  port: number;
  corsAllowedOrigins: string[];
  swagger: { enabled: boolean };
  logging: { level: LogLevelName; json: boolean };
  database: {
    type: DatabaseType;
    host: string;
    port: number;
    instanceName?: string;
    username: string;
    password: string;
    name: string;
    encrypt: boolean;
    trustServerCertificate: boolean;
    poolMax: number;
    sqlitePath: string;
    logging: boolean;
  };
  jwt: {
    key: string;
    issuer: string;
    audience: string;
    expiryMinutes: number;
  };
}

export class ConfigurationError extends Error {
  constructor(details: string) {
    super(`Invalid environment configuration:\n${details}`);
    this.name = 'ConfigurationError';
  }
}

const DEFAULT_LOG_LEVEL: Record<Environment, LogLevelName> = {
  development: 'debug',
  test: 'warn',
  production: 'log',
};

function withoutEmptyValues(raw: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(
    Object.entries(raw).filter((entry): entry is [string, string] => entry[1] !== undefined && entry[1].trim() !== ''),
  );
}

export function loadAppConfig(raw: NodeJS.ProcessEnv): AppConfig {
  const parsed = envSchema.safeParse(withoutEmptyValues(raw));
  if (!parsed.success) {
    throw new ConfigurationError(z.prettifyError(parsed.error));
  }

  const env = parsed.data;
  const isProduction = env.NODE_ENV === 'production';

  return {
    env: env.NODE_ENV,
    isProduction,
    port: env.PORT,
    corsAllowedOrigins: (env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:4200')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    swagger: { enabled: env.SWAGGER_ENABLED ?? !isProduction },
    logging: {
      level: env.LOG_LEVEL ?? DEFAULT_LOG_LEVEL[env.NODE_ENV],
      json: (env.LOG_FORMAT ?? (isProduction ? 'json' : 'pretty')) === 'json',
    },
    database: {
      type: env.DB_TYPE,
      host: env.DB_HOST,
      port: env.DB_PORT,
      instanceName: env.DB_INSTANCE,
      username: env.DB_USER,
      password: env.DB_PASSWORD ?? '',
      name: env.DB_NAME,
      encrypt: env.DB_ENCRYPT ?? isProduction,
      trustServerCertificate: env.DB_TRUST_SERVER_CERTIFICATE ?? !isProduction,
      poolMax: env.DB_POOL_MAX,
      sqlitePath: env.SQLITE_PATH,
      logging: env.DB_LOGGING,
    },
    jwt: {
      key: env.JWT_KEY ?? DEVELOPMENT_JWT_KEY,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      expiryMinutes: env.JWT_EXPIRY_MINUTES,
    },
  };
}

export const APP_CONFIG = Symbol('APP_CONFIG');
