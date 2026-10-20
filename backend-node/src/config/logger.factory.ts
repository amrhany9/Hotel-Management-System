import { ConsoleLogger, LogLevel } from '@nestjs/common';
import type { AppConfig } from './app.config';

const SEVERITY_ORDER: LogLevel[] = ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'];

export function createLogger(config: AppConfig): ConsoleLogger {
  const threshold = SEVERITY_ORDER.indexOf(config.logging.level);
  return new ConsoleLogger({
    logLevels: SEVERITY_ORDER.slice(0, threshold + 1),
    json: config.logging.json,
    colors: !config.logging.json,
  });
}
