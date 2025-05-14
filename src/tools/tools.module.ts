import { Module } from '@nestjs/common';
import { ToolExecutorService } from './tool-executor.service';
import { LogModule } from '../log/log.module';

@Module({
  imports: [LogModule], // подключаем лог-модуль
  providers: [ToolExecutorService],
  exports: [ToolExecutorService],
})
export class ToolsModule {}