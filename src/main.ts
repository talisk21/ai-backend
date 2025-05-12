import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bull';
import { STEP_QUEUE } from './queue/queue.constants';
import { BullAdapter } from '@bull-board/api/bullAdapter';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Bull Board UI
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const stepQueue = app.get<Queue>(`BullQueue_${STEP_QUEUE}`);

  createBullBoard({
    queues: [new BullAdapter(stepQueue)],
    serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());

  app.enableCors({
    origin: '*',
  });

  await app.listen(3000);
}
bootstrap();