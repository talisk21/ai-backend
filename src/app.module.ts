import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { ExecutionsModule } from "./executions/executions.module";
import { BullModule } from "@nestjs/bull";
import { QueueModule } from "./queue/queue.module";
import { ModelsModule } from "./models/models.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { LogModule } from "./log/log.module";
import { RequestLoggerMiddleware } from "./log/request-logger.middleware";
import { ToolsModule } from "./tools/tools.module";
import { MailModule } from "./mail/mail.module";
import { TelegramService } from "./telegram/telegram.service";
import { ConfigModule } from "@nestjs/config";
import { AgentModule } from "./agents/agents.module";
import { MinioService } from "./files/minio.service";
import { FilesModule } from "./files/files.module";
import { FileConverterService } from "./files/file-converter.service";

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: "localhost",
        port: 6379
      }
    }),
    PrismaModule,
    ExecutionsModule,
    QueueModule,
    ModelsModule,
    LogModule,
    ToolsModule,
    MailModule,
    ConfigModule.forRoot({
      isGlobal: true // <== делает ConfigService доступным глобально
    }),
    AgentModule,
    FilesModule
  ],
  controllers: [AppController],
  providers: [AppService, TelegramService, MinioService, FileConverterService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes("*"); // 👈 логирует все HTTP-запросы
  }
}