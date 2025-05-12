import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { StepProcessor } from './step.processor';
import { STEP_QUEUE } from './queue.constants';
import { OpenRouterService } from '../agents/openrouter.service';
import { AgentGatewayService } from '../agents/agent-gateway.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: STEP_QUEUE,
    }),
  ],
  providers: [
    StepProcessor,
    OpenRouterService,
    AgentGatewayService,
  ],
})
export class QueueModule {}