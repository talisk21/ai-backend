import { BullModule } from "@nestjs/bull";
import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";

// 1. Сервисы-агенты и инструменты
import { AgentGatewayService } from "agents/agent-gateway.service";
import { LLmAgent } from "agents/llm-agent";
import { LlmToolAgent } from "agents/llm-tool-agent";
import { LlmToolDecisionAgent } from "agents/llm-tool-decision-agent";

// 2. Агенты
import { OpenRouterService } from "agents/openrouter.service";

// 3. Бизнес-слой
import { ExecutionsService } from "executions/executions.service";

// 4. Файловые и почтовые сервисы + модели
import { FilesService } from "files/files.service";
import { MinioService } from "files/minio.service";
import { LogService } from "log/log.service";
import { MailService } from "mail/mail.service";
import { ModelRegistryService } from "models/model-registry.service";

// 5. Инфраструктура
import { PrismaService } from "prisma/prisma.service";
import { STEP_QUEUE } from "queue/queue.constants";
import { StepProcessor } from "queue/step.processor";
import { RouteService } from "routes/route.service";
import { TelegramService } from "telegram/telegram.service";
import { ToolProxyService } from "tools/tool-proxy.service";
import { ToolSpecOpenRouterAdapter } from "tools/tool-spec-openrouter-adapter";

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (cfg: ConfigService) => ({
        redis: {
          host: cfg.get('REDIS_HOST', 'localhost'),
          port: cfg.get('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({ name: STEP_QUEUE }),
  ],
  providers: [
    PrismaService,
    LogService,
    AgentGatewayService,
    OpenRouterService,
    ToolProxyService,
    ToolSpecOpenRouterAdapter,
    FilesService,
    MinioService,
    MailService,
    ModelRegistryService,
    ExecutionsService,
    RouteService,
    TelegramService,
    StepProcessor,
    LLmAgent,
    LlmToolAgent,
    LlmToolDecisionAgent,
  ],
  exports: [
    PrismaService,
    LogService,
    AgentGatewayService,
    OpenRouterService,
    ToolProxyService,
    ToolSpecOpenRouterAdapter,
    FilesService,
    MinioService,
    MailService,
    ModelRegistryService,
    ExecutionsService,
    RouteService,
    TelegramService,
    LLmAgent,
    LlmToolAgent,
    LlmToolDecisionAgent,
  ],
})
export class CoreModule {}
