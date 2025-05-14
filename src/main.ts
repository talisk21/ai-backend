import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { Queue } from 'bull';
import { STEP_QUEUE } from './queue/queue.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS для фронтенда
  app.enableCors({
    origin: '*',
  });

  // Bull Board UI подключение
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  // Получаем очередь из контейнера Nest
  const stepQueue = app.get<Queue>(`BullQueue_${STEP_QUEUE}`);

  createBullBoard({
    queues: [new BullAdapter(stepQueue)],
    serverAdapter,
  });

  // Подключаем роут
  app.use('/admin/queues', serverAdapter.getRouter());

  await app.listen(3000);
  console.log('🚀 Backend запущен на http://localhost:3000');
  console.log('📊 Bull Board доступен по адресу http://localhost:3000/admin/queues');
}
bootstrap();