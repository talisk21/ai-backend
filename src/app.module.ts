import { Module } from '@nestjs/common';

import { ControllersModule } from './core/controllers.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [CoreModule, ControllersModule],
})
export class AppModule {}
