import { Global, Module } from '@nestjs/common';
import { APP_CONFIG } from './app.config';
import { loadEnvironment } from './load-environment';

@Global()
@Module({
  providers: [{ provide: APP_CONFIG, useFactory: loadEnvironment }],
  exports: [APP_CONFIG],
})
export class AppConfigModule {}
