import { z } from 'zod';

export const DEVELOPMENT_JWT_KEY = 'super_secret_hotel_management_jwt_key_2026_dotnet8!_must_be_long_enough';

const LOG_LEVELS = ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'] as const;
export type LogLevelName = (typeof LOG_LEVELS)[number];

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
    PORT: z.coerce.number().int().min(1).max(65_535).default(5001),
    CORS_ALLOWED_ORIGINS: z.string().optional(),

    DB_TYPE: z.enum(['mssql', 'sqlite']).default('mssql'),
    DB_HOST: z.string().default('localhost'),
    DB_PORT: z.coerce.number().int().min(1).max(65_535).default(1433),
    DB_INSTANCE: z.string().optional(),
    DB_USER: z.string().default('sa'),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().default('HotelManagementDb'),
    DB_ENCRYPT: z.stringbool().optional(),
    DB_TRUST_SERVER_CERTIFICATE: z.stringbool().optional(),
    DB_POOL_MAX: z.coerce.number().int().min(1).default(10),
    DB_LOGGING: z.stringbool().default(false),
    SQLITE_PATH: z.string().default('data/hotel.sqlite'),

    JWT_KEY: z.string().optional(),
    JWT_ISSUER: z.string().default('HotelManagementApi'),
    JWT_AUDIENCE: z.string().default('HotelManagementApp'),
    JWT_EXPIRY_MINUTES: z.coerce.number().int().min(1).default(1440),

    LOG_LEVEL: z.enum(LOG_LEVELS).optional(),
    LOG_FORMAT: z.enum(['pretty', 'json']).optional(),
    SWAGGER_ENABLED: z.stringbool().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.JWT_KEY !== undefined && Buffer.byteLength(env.JWT_KEY, 'utf8') < 32) {
      ctx.addIssue({ code: 'custom', path: ['JWT_KEY'], message: 'must be at least 32 bytes long for HS256' });
    }

    if (env.NODE_ENV !== 'production') return;

    if (!env.JWT_KEY) {
      ctx.addIssue({ code: 'custom', path: ['JWT_KEY'], message: 'is required in production' });
    } else if (env.JWT_KEY === DEVELOPMENT_JWT_KEY) {
      ctx.addIssue({ code: 'custom', path: ['JWT_KEY'], message: 'must not be the public development key in production' });
    }
    if (!env.CORS_ALLOWED_ORIGINS) {
      ctx.addIssue({ code: 'custom', path: ['CORS_ALLOWED_ORIGINS'], message: 'is required in production' });
    }
    if (env.DB_TYPE === 'mssql' && !env.DB_PASSWORD) {
      ctx.addIssue({ code: 'custom', path: ['DB_PASSWORD'], message: 'is required in production' });
    }
  });

export type Env = z.infer<typeof envSchema>;
