import { Controller, Get } from '@nestjs/common';
import { ModelRegistryService } from './model-registry.service';

@Controller('models')
export class ModelsController {
  constructor(private readonly registry: ModelRegistryService) {}

  @Get()
  async list() {
    return this.registry.getAvailableModels();
  }
}