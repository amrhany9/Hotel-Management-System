import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';
import { ApplicationModule } from './application/application.module';
import { AppConfigModule } from './config/app-config.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [AppConfigModule, InfrastructureModule, ApplicationModule, ApiModule],
})
export class AppModule {}
