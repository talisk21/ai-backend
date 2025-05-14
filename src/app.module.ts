import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ExecutionsModule } from './executions/executions.module';
import { BullModule } from '@nestjs/bull';
import { QueueModule } from './queue/queue.module';
import { ModelsModule } from './models/models.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LogModule } from './log/log.module';
import { RequestLoggerMiddleware } from './log/request-logger.middleware';
import { ToolsModule } from './tools/tools.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    PrismaModule,
    ExecutionsModule,
    QueueModule,
    ModelsModule,
    LogModule,
    ToolsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .forRoutes('*'); // 👈 логирует все HTTP-запросы
  }
}