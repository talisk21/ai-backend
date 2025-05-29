import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ExecutionsService } from './executions.service';

@Controller('executions')
export class ExecutionsController {
  constructor(private readonly service: ExecutionsService) {}

  @Post()
  create() {
    return this.service.createExecution();
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getExecution(id);
  }

  @Post(':id/steps')
  addStep(
    @Param('id') executionId: string,
    @Body() body: { type: string; input: any },
  ) {
    return this.service.addStep(executionId, body.type, body.input);
  }

  @Post('run/:templateId')
  runFromTemplate(@Param('templateId') templateId: string) {
    return this.service.runRouteFromTemplate(templateId);
  }

  // 💬 Пользовательский ответ для шага в режиме ожидания
  @Post(':executionId/steps/:stepId/respond')
  respondToStep(
    @Param('executionId') executionId: string,
    @Param('stepId') stepId: string,
    @Body() body: { userMessage: string },
  ) {
    return this.service.respondToWaitingStep(
      executionId,
      stepId,
      body.userMessage,
    );
  }
}
