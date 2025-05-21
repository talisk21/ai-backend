import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { StepProcessor } from "./step.processor";
import { STEP_QUEUE } from "./queue.constants";
import { OpenRouterService } from "../agents/openrouter.service";
import { PrismaModule } from "../prisma/prisma.module";
import { LogModule } from "../log/log.module";
import { ToolsModule } from "../tools/tools.module";
import { AgentModule } from "../agents/agents.module";

@Module({
  imports: [
    BullModule.registerQueue({ name: STEP_QUEUE }),
    PrismaModule,
    ToolsModule,
    LogModule,
    AgentModule
  ],
  providers: [
    StepProcessor,
    OpenRouterService
  ]
})
export class QueueModule {
}