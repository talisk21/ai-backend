import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { StepProcessor } from './step.processor';
import { STEP_QUEUE } from './queue.constants';
import { OpenRouterService } from '../agents/openrouter.service';
import { AgentGatewayService } from '../agents/agent-gateway.service';
import { PrismaModule } from '../prisma/prisma.module';
import { LogModule } from '../log/log.module';
import { ToolsModule } from '../tools/tools.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: STEP_QUEUE,
    }),
    LogModule,
    ToolsModule,
  ],
  providers: [
    StepProcessor,
    OpenRouterService,
    AgentGatewayService,
  ],
})
export class QueueModule {}