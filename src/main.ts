import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { ConfigService } from '@nestjs/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Queue } from 'bull';
import { AppModule } from './app.module';
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

  const config = app.get(ConfigService);
  const host = config.get<number>('BACKEND_HOST');
  const port = config.get<number>('BACKEND_PORT');

  await app.listen(port);
  console.log(`🚀 Backend запущен на http://${host}:${port}`);
  console.log(
    `📊 Bull Board доступен по адресу http://${host}:${port}/admin/queues`,
  );
}

bootstrap();
