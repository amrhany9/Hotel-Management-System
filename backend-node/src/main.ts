import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { configureApp, setupSwagger } from './api/configure-app';
import { AppModule } from './app.module';
import { loadEnvironment } from './config/load-environment';
import { createLogger } from './config/logger.factory';

async function bootstrap(): Promise<void> {
  const config = loadEnvironment();
  const app = await NestFactory.create(AppModule, { logger: createLogger(config) });
  configureApp(app);

  if (config.swagger.enabled) {
    setupSwagger(app);
  }

  await app.listen(config.port);

  const logger = new Logger('Program');
  const baseUrl = `http://localhost:${config.port}`;
  logger.log(`Hotel Management API listening on ${baseUrl} (environment: ${config.env}, database: ${config.database.type})`);
  logger.log(`SignalR hub: ${baseUrl}/hubs/reservations`);
  if (config.swagger.enabled) {
    logger.log(`Swagger UI: ${baseUrl}/swagger`);
  }
}

bootstrap().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
