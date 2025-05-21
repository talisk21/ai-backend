import { Injectable, Logger } from "@nestjs/common";
import { Tool, ToolInputSpecField } from "./tool.interface";
import { toolRegistry } from "./tool-registry";


@Injectable()
export class ToolExecutorService {
  private readonly tools: Map<string, Tool> = new Map();
  private readonly logger = new Logger(ToolExecutorService.name);

  constructor() {
    for (const tool of toolRegistry) {
      this.tools.set(tool.name, tool);
    }
  }

  /**
   * Выполняет инструмент по имени
   */
  async run(name: string, args: any): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      this.logger.log(`❌ Инструмент "${name}" не найден`);
      throw new Error(`Инструмент "${name}" не найден`);
    }

    this.logger.log(`▶️ Запуск инструмента "${name}" с аргументами: ${JSON.stringify(args)}`);

    try {
      const result = await tool.run(args);
      this.logger.log(`✅ Результат "${name}": ${result}`);
      return result;
    } catch (error: any) {
      this.logger.log(`❌ Ошибка при выполнении "${name}": ${error.message}`);
      throw error;
    }
  }

  /**
   * Возвращает список всех инструментов с описанием
   */
  getToolList(): { name: string; description: string; spec?: ToolInputSpecField[] }[] {
    return Array.from(this.tools.values()).map((tool) => ({
      name: tool.name,
      description: tool.description,
      spec: tool?.inputSpec
    }));
  }
}