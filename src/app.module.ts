import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ExecutionsModule } from './executions/executions.module';
import { BullModule } from '@nestjs/bull';
import { QueueModule } from './queue/queue.module';
import { ModelsModule } from './models/models.module';
   
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}