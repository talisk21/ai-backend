import { Injectable } from '@nestjs/common';
import { toolRegistry } from './tool-registry';
import { LogService } from '../log/log.service';

@Injectable()
export class ToolExecutorService {
  constructor(private readonly log: LogService) {}

  async run(toolName: string, input: any): Promise<string> {
    const tool = toolRegistry.find((t) => t.name === toolName);

    if (!tool) {
      const message = `❌ Неизвестный инструмент: ${toolName}`;
      await this.log.error(message, 'ToolExecutorService', { toolName, input });
      throw new Error(message);
    }

    try {
      const output = await tool.run(input);

      await this.log.info(`🛠️ Выполнен инструмент: ${toolName}`, 'ToolExecutorService', {
        tool: toolName,
        input,
        output,
      });

      return output;
    } catch (error: any) {
      await this.log.error(`❌ Ошибка в инструменте: ${toolName}`, 'ToolExecutorService', {
        tool: toolName,
        input,
        error: error.message,
      });

      return `❌ Ошибка при выполнении инструмента "${toolName}": ${error.message}`;
    }
  }
}