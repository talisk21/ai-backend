import { Module } from '@nestjs/common';
import { ExecutionsService } from './executions.service';
import { ExecutionsController } from './executions.controller';
import { BullModule } from '@nestjs/bull';
import { STEP_QUEUE } from '../queue/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: STEP_QUEUE,
    }),
  ],
  controllers: [ExecutionsController],
  providers: [ExecutionsService],
})
export class ExecutionsModule {}