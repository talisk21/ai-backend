import { Module } from '@nestjs/common';
import { ModelsController } from './models.controller';
import { ModelRegistryService } from './model-registry.service';

@Module({
  controllers: [ModelsController],
  providers: [ModelRegistryService],
  exports: [ModelRegistryService],
})
export class ModelsModule {}