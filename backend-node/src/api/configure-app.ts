import { INestApplication, RequestMethod } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { APP_CONFIG, AppConfig } from '../config/app.config';
import { ModelBindingPipe } from './binding/model-binding.pipe';
import { ExceptionHandlingFilter } from './middleware/exception-handling.filter';

export function configureApp(app: INestApplication): AppConfig {
  const config = app.get<AppConfig>(APP_CONFIG);

  app.useGlobalFilters(new ExceptionHandlingFilter());

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'hubs/reservations/negotiate', method: RequestMethod.POST }],
  });

  app.enableCors({
    origin: config.corsAllowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.useGlobalPipes(new ModelBindingPipe());
  app.enableShutdownHooks();

  return config;
}

export function setupSwagger(app: INestApplication): void {
  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Hotel Management API')
      .setDescription('NestJS Web API for Hotel Management System')
      .setVersion('v1')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .build(),
  );
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: 'swagger/v1/swagger.json',
  });
}
