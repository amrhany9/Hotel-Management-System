import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppConfig, loadAppConfig } from './app.config';

const DEVELOPMENT_ENV_FILE = '.env';

let cached: AppConfig | undefined;

export function loadEnvironment(): AppConfig {
  if (cached) return cached;

  if (process.env.NODE_ENV === 'development') {
    const envFile = resolve(DEVELOPMENT_ENV_FILE);
    if (existsSync(envFile)) {
      process.loadEnvFile(envFile);
    }
  }

  cached = loadAppConfig(process.env);
  return cached;
}
