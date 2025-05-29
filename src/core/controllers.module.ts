import { Module } from '@nestjs/common';
import { ExecutionsController } from '../executions/executions.controller';
import { ModelsController } from '../models/models.controller';
import { RouteController } from '../routes/route.controller';
import { ToolsController } from '../tools/tools.controller';
import { CoreModule } from './core.module';

@Module({
  imports: [CoreModule],
  controllers: [
    ExecutionsController,
    RouteController,
    ModelsController,
    ToolsController,
  ],
})
export class ControllersModule {}
